# CodeRabbit Workflow Test

This is a test file to verify the CodeRabbit integration workflow.

## Features to test:

1. Automatic commit and push
2. PR creation
3. CodeRabbit review waiting
4. Bot comment summarization
5. Vercel preview deployment

## Test Code

```javascript
// This code has some intentional issues for CodeRabbit to find
function testFunction(x) {
    var result = x * 2;
    if(result>10){
        console.log("Result is greater than 10");
    }
    return result
}

// Missing semicolon above
// No proper spacing in if condition
// var instead of const/let
```

This file will trigger the workflow when committed.
