import React, { Component } from 'react';
import './App.css';
import TodoListContract from './contracts/TodoList.json';
import getWeb3 from './getWeb3';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      todoList: [],
      web3: null,
      accounts: null,
      contract: null,
      loading: true,
      text: '',
    };
    this.createTask = this.createTask.bind(this);
    this.toggleCompleted = this.toggleCompleted.bind(this);
  }

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = TodoListContract.networks[networkId];
      const instance = new web3.eth.Contract(
        TodoListContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState(
        { web3, accounts, contract: instance, loaded: false },
        this.runExample,
      );
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  createTask(content) {
    this.setState({ loading: true });
    this.state.contract.methods
      .createTask(content)
      .send({ from: this.state.accounts.toString() })
      .once('receipt', function () {
        this.setState({ loading: false });
      });
  }

  toggleCompleted(taskId) {
    this.setState({ loading: true });
    this.state.contract.methods
      .toggleCompleted(taskId)
      .send({ from: this.state.accounts.toString() })
      .on('receipt', function () {
        this.setState({ loading: false });
      });
  }

  runExample = async () => {
    const { accounts, contract } = this.state;
    const taskCount = await contract.methods.taskCount().call();
    this.setState({ taskCount });
    for (var i = 1; i <= taskCount; i++) {
      const task = await contract.methods.tasks(i).call();
      this.setState({
        todoList: [...this.state.todoList, task],
      });
    }
  };

  render() {
    if (!this.state.loading) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>{this.state.accounts}</h1>
        <input
          placeholder="Type here"
          onChange={(e) => this.setState({ text: e.target.value })}
        />
        <button onClick={() => this.createTask(this.state.text)}>
          Add Todo
        </button>
        <div className="container">
          {this.state.todoList.map((todo, index) => {
            return (
              <div className="todo" key={index}>
                <input
                  type="checkbox"
                  defaultChecked={todo[2]}
                  onChange={() => this.toggleCompleted(todo[0])}
                />
                <p>{todo[1]}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

export default App;
