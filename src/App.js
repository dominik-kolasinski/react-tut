import React, {Component} from 'react';
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

// nice refactor:
// function isSearched(searchTerm) {
//   return function(item) {
//     return item.title.toLowerCase().includes(searcTerm.toLowerCase());
//   }
// }

const isSearched = searchTerm => item =>
  item.title.toLowerCase().includes(searchTerm.toLowerCase());

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      list,
      counter,
      searchTerm: '',
    };

    this.onDismiss = this.onDismiss.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
  }

  onDismiss(id) {
    const updatedList = this.state.list.filter(item => item.objectID !== id);
    const updatedCounter = this.state.counter + 1;
    this.setState({list: updatedList, counter: updatedCounter});
  }

  onSearchChange(event) {
    console.log(event.target.value);
    this.setState({searchTerm: event.target.value});
  }

  render() {
    const {searchTerm, list, counter} = this.state;
    return (
      <div className="App">
        <h1>{counter}</h1>
        <Search
          value={searchTerm}
          onChange={this.onSearchChange}
        >
          Search
        </Search>
        <Table
          list={list}
          pattern={searchTerm}
          onDismiss={this.onDismiss}
        />
      </div>
    );
  }
}

const Search = ({value, onChange, children}) => {
  return(
    <form>
      {children}
      <input
        type="text"
        value={value}
        onChange={onChange}
      />
    </form>
  );
}

const Table = ({ list, pattern, onDismiss }) => {
  return (
    <div>
      {list.filter(isSearched(pattern)).map(item =>
        <div key={item.objectID}>
            <span>
              <a href={item.url}> {item.title}</a>
            </span>
          <span> {item.author}</span>
          <span> {item.num_comments}</span>
          <span> {item.points}</span>
          <span>
              <Button onClick={() => onDismiss(item.objectID)}>
                Dismiss
              </Button>
            </span>
        </div>
      )}
    </div>
  );
}

const Button = ({ onClick, className = '', children }) => {
  return(
    <button
      onClick={onClick}
      className={className}
      type="button"
    >
      this is "{children}" button
    </button>
  );
}

export default App;