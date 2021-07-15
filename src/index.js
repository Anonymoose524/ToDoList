import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import './index.css';

class App extends React.Component {
  constructor(props){
    super(props);

  }

  render() {
    return (
      <Card>
        <CardContent>
          <h1>To Do:</h1>
          <TaskList />
        </CardContent>
      </Card>
    );
  }
}

class TaskList extends React.Component {
  constructor(props){
    super(props);
    this.state = {tasks: []};

    this.removeTask = this.removeTask.bind(this);
  }

  async componentDidMount(){
    let tempState = [];
    await fetch('https://localhost:5001/api/TodoItems')
      .then(response => response.json())
      .then(data => {
        for(var i of data){
          tempState.push(<Task taskID = {i.idNum} value={i.name} removeTask={this.removeTask}/>)
        }
      });

    this.setState({tasks: tempState});
  }

  returnTask = async (newTask) => {

    let key = -1;
    await fetch('https://localhost:5001/api/TodoItems', {
      method: 'POST',
      headers: { 
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: newTask,
      })
    })
    .then(response => response.json())
    .then(data => {key = data.idNum});

    let temp = this.state.tasks;
    temp.push(<Task taskID = {key} value={newTask} removeTask={this.removeTask}/>)
    this.setState({tasks: temp});

  };

  removeTask = (name) => {
    this.setState({tasks: this.state.tasks.filter((item) => {
      if(item.props.value == name){
        let id = item.props.taskID;
        fetch('https://localhost:5001/api/TodoItems/' + id, {
          method: 'DELETE'
        });
        return false;
      }
      return true;
    })});
  };
    

  render(){
    return (
      <div>
        <ul> <ToList list={this.state.tasks} /> </ul>
        <Input returnTask={this.returnTask} />
      </div>
    );
  }
}

class Input extends React.Component {
  constructor(props) {
    super(props);
    this.state = { text: '' };
  }
  handleSubmit = (event) => {
    event.preventDefault();
    this.props.returnTask(this.state.text);
    document.getElementById("textInput").reset();
  }
  handleChange = (event) => {
    this.setState({text: event.target.value});
  }
  render() {
    return (
      <form id='textInput' onSubmit={this.handleSubmit}>
      <p>New Task:</p>
      <input
        type='text'
        onChange={this.handleChange}
      />
      <input
        type='submit'
      />
      </form>
    );
  }
}

function ToList(props){
  const list = props.list;
  const listed = list.map((value) =>
    <li key = {value.props.taskID.toString()}>
      {value}
    </li>);
  return listed;
}

function Task(props) {
  const taskID = props.taskID;
  const task = props.value;
  const handleRemove = (event) => {
    event.preventDefault();
    props.removeTask(task);
  }
  return (
    <div>
      <p>
        {task}
        <Button onClick={handleRemove}>Delete</Button>
      </p>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));

