const dataSet = (levels = 1) => {
  const dataset = [];

  for (let aux = 0; aux <= levels; aux += 1) {
    const parent = {
      children: [
        {
          children: [],
          id: aux,
        },
      ],
      id: aux,
    };

    dataset.push(parent);
  }

  return dataset;
};


module.exports = dataSet;
