import React, { useEffect, useState } from 'react';
import './App.css';
import TodoListContract from './contracts/TodoList.json';
import getWeb3 from './getWeb3';

const App = () => {
  const [todoState, setTodoState] = useState({
    todoList: [],
    web3: null,
    account: null,
    contract: null,
    loading: true,
    text: '',
  });

  const {text,web3,loading,todoList,account,contract} = todoState

  const loadBlockchainData = async() =>{
  try {
    // Get network provider and web3 instance.
    const web3 = await getWeb3();

    // Use web3 to get the user's accounts.
    const account = await web3.eth.getAccounts();

    // Get the contract instance.
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = TodoListContract.networks[networkId];
    const contract = new web3.eth.Contract(
      TodoListContract.abi,
      deployedNetwork && deployedNetwork.address,
    );

    // Set web3, accounts, and contract to the state, and then proceed with an
    // example of interacting with the contract's methods.
    setTodoState({ ...todoState,web3, account, contract, loading: false });

  } catch (error) {
    console.log(error);
    // Catch any errors for any of the above operations.
    // alert(
    //   `Failed to load web3, accounts, or contract. Check console for details.`,
    // );
    console.error(error);
  }
  }

   async function run() {
     const taskCount = await contract.methods.taskCount().call();
     // setTodoState({ ...todoState, [taskCount]: taskCount });
    //  console.log(taskCount,'COUNT');
    let arr = []
    for (let i = 1; i <= taskCount; i++) {
      const task = await contract.methods.tasks(i).call();
      arr.push(task)
      //  console.log(todoList);
    //  setTodoState({ ...todoState, todoList: [...todoList, task] });
    }
    console.log(arr);
         setTodoState({ ...todoState, todoList:arr });
   }

  useEffect(() => {
   (async ()=>{
    await loadBlockchainData()
   })()
  }, []);

  useEffect(() =>{
    if(contract) run()
  },[contract])


    const createTask = (content)=> {
    setTodoState({ ...todoState,loading: true });
      contract.methods
      .createTask(content)
      .send({ from: account.toString() })
      .once('receipt', function () {
        setTodoState({ ...todoState,loading:false });
      });
  }

  const toggleCompleted = (taskId) => {
    setTodoState({...todoState,loading: true });
    contract.methods
      .toggleCompleted(taskId)
      .send({ from: account.toString() })
      .on('receipt', function () {
       setTodoState({...todoState, loading: false });
      });
  }


  if (loading) {
        return <div>Loading Web3, accounts, and contract...</div>;
  }

  return (
    <div>
      <h1>{account}</h1>
      <input
        placeholder="Type here"
        onChange={(e) => setTodoState({ ...todoState,text: e.target.value })}
      />
      <button onClick={() => createTask(text)}>Add Todo</button>
      <div className="container">
        {todoList.map((todo, index) => {
          console.log(todo);
          return (
            <div className="todo" key={index}>
              <input
                type="checkbox"
                defaultChecked={todo.completed}
                onChange={() => toggleCompleted(todo[0])}
              />
              <p>{todo[1]}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default App;
