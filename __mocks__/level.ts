import levelTest from 'level-test';

const levelMock = jest.fn(levelTest({ mem: true }));

export default levelMock;
