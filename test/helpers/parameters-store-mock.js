const variableName = 'APP_SECRET';
const variableValue = 'The secret';

function getParametersByPath(params) {
  const promise = new Promise((resolve) => {
    const key = `${params.Path}${variableName}`;
    const result = {
      Parameters: [
        {
          Name: key,
          Value: variableValue,
        },
      ],
    };

    resolve(result);
  });

  return {
    promise: () => promise,
  };
}

module.exports = {
  getParametersByPath,
  variableName,
  variableValue,
};
