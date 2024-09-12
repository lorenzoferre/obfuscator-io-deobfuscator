import { traverse, parse, types as t } from "@babel/core";
import _generate from "@babel/generator";
const generate = _generate.default;
import vm from "vm";

let memoizationFunction;
let obfuscatorDecoderFunction;

function isMemoizationFunction(path) {
  const body = path.node.body.body;
  if (body.length !== 3) return false;
  if (
    !t.isVariableDeclaration(body[0]) ||
    !t.isExpressionStatement(body[1]) ||
    !t.isAssignmentExpression(body[1].expression) ||
    !t.isIdentifier(body[1].expression.left) ||
    !t.isFunctionExpression(body[1].expression.right) ||
    !t.isReturnStatement(body[2])
  )
    return false;
  memoizationFunction = path.node.id.name;
  return true;
}

function isObfuscatorDecoderFunction(path) {
  const body = path.node.body.body;
  if (body.length !== 2) return false;
  if (
    !t.isVariableDeclaration(body[0]) ||
    !t.isReturnStatement(body[1]) ||
    !t.isSequenceExpression(body[1].argument) ||
    body[1].argument.expressions.length !== 2 ||
    !t.isAssignmentExpression(body[1].argument.expressions[0]) ||
    !t.isIdentifier(body[1].argument.expressions[0].left) ||
    !t.isFunctionExpression(body[1].argument.expressions[0].right) ||
    !t.isCallExpression(body[1].argument.expressions[1])
  )
    return false;
  obfuscatorDecoderFunction = path.node.id.name;
  return true;
}

export function deobfuscate(code) {
  let ast = parse(code);
  const context = vm.createContext();

  traverse(ast, {
    // finding the memoization function and the decoder function
    FunctionDeclaration: {
      enter(path) {
        if (isMemoizationFunction(path)) {
          vm.runInContext(generate(path.node).code, context);
          return;
        }
        if (isObfuscatorDecoderFunction(path)) {
          vm.runInContext(generate(path.node).code, context);
          return;
        }
      },
    },
    // evaluating jsfuck unary expressions
    UnaryExpression: {
      enter(path) {
        const { confident, value } = path.evaluate();
        if (confident) {
          path.replaceWith(t.valueToNode(value));
          path.skip();
        }
      },
    },
    // transforming numeric literals from hex to decimal
    NumericLiteral: {
      enter(path) {
        if (path.node?.extra) delete path.node.extra;
      },
    },
  });

  traverse(ast, {
    // finding the IIFE function
    ExpressionStatement: {
      enter(path) {
        if (t.isFunctionExpression(path.node.expression?.callee)) {
          vm.runInContext(generate(path.node).code, context);
          path.remove();
          path.stop;
        }
      },
    },
    // tracking variables which have a reference to functions saved in the context
    VariableDeclarator: {
      enter(path) {
        if (path.node.init?.name in context) {
          vm.runInContext(generate(path.node).code, context);
        }
      },
    },
    // evaluating call expressions, and if the value is a literal, replace the current node with the new one.
    CallExpression: {
      enter(path) {
        if (!(path.node.callee.name in context)) return;
        const hasInvalidArgument = path.node.arguments.some(
          argument => t.isIdentifier(argument) && !(argument.name in context)
        );
        if (hasInvalidArgument) return;
        const value = vm.runInContext(generate(path.node).code, context);
        const node = t.valueToNode(value);
        if (t.isLiteral(node)) {
          path.replaceWith(t.valueToNode(value));
        }
      },
    },
  });

  // regeneration of the ast to update the bindings
  ast = parse(generate(ast).code);

  traverse(ast, {
    // removing the two functions that are saved in the context
    FunctionDeclaration: {
      enter(path) {
        if (
          path.node.id.name === memoizationFunction ||
          path.node.id.name === obfuscatorDecoderFunction
        )
          path.remove();
      },
    },
    // removing variables that are not referenced
    VariableDeclarator: {
      enter(path) {
        const binding = path.scope.getBinding(path.node.id.name);
        if (!binding) return;
        if (binding.constant && !binding.referenced) {
          path.remove();
        }
      },
    },
    // transforming brackets to dot notation
    MemberExpression: {
      enter(path) {
        const property = path.node?.property;
        if (!property) return;
        if (!t.isStringLiteral(property)) return;
        path.node.property = t.identifier(property.value);
        path.node.computed = false;
      },
    },
  });

  const out = generate(ast).code;
  return out;
}
