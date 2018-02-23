import React, { Component } from 'react';
import './App.css';

const list = [
  {
    title: 'React',
    url: 'https://facebook.github.io/react/',
    author: 'Jordan Walke',
    num_comments: 3,
    points: 4,
    objectID: 0,
  },
  {
    title: 'Redux',
    url: 'https://github.com/reactjs/redux',
    author: 'Dan Abramov, Andrew Clark',
    num_comments: 2,
    points: 5,
    objectID: 1,
  },
];

const counter = 0;

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      list,
      counter,
    };

    this.onDismiss = this.onDismiss.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
  }

  onDismiss(id) {
    const updatedList = this.state.list.filter(item => item.objectID !== id);
    const updatedCounter = this.state.counter + 1;
    this.setState({list: updatedList, counter: updatedCounter});
  }

  onSearchChange() {

  }

  render() {
    return (
      <div className="App">
          <form>
              <input type="text"
              onChange={this.onSearchChange}/>
          </form>
        <h1>{this.state.counter}</h1>
        {this.state.list.map(item => {
          const onHandleDismiss = () => this.onDismiss(item.objectID);

          return (
            <div key={item.objectID}>
              <span>
                  <a href={item.url}>{item.title}</a>
              </span>
              <span>{item.author}</span>
              <span>{item.num_comments}</span>
              <span>{item.points}</span>
              <span>
              <button
                onClick={onHandleDismiss}
                type="button">
                Dismiss
              </button>
            </span>
            </div>
          );
        })}
      </div>
    );
  }
}

export default App;