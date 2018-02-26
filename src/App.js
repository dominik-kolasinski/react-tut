import React, {Component} from 'react';
import './App.css';

const DEFAULT_QUERY = 'redux';

const PATH_BASE =  'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';

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
      result: null,
      counter: 0,
      searchTerm: DEFAULT_QUERY,
    };

    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
  }

  setSearchTopStories(result) {
    this.setState({ result });
  }

  fetchSearchTopStories(searchTerm) {
    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}`)
      .then(response => response.json())
      .then(result => this.setSearchTopStories(result))
      .catch(e => e);
  }

  componentDidMount() {
    const { searchTerm } = this.state;
    this.fetchSearchTopStories(searchTerm);
  }

  onDismiss(id) {
    const isNotId = item => item.objectID !== id;
    const updatedHits = this.state.result.hits.filter(isNotId);
    const updatedCounter = this.state.counter + 1;
    this.setState({
      result: Object.assign({}, this.state.result, {hits: updatedHits}),
      // spread syntax alternative (not yeat in ES6):
      // result: {...this.state.result, hits: updatedHits},
      counter: updatedCounter
    });
  }

  onSearchChange(event) {
    console.log(event.target.value);
    this.setState({searchTerm: event.target.value});
  }

  render() {
    const { searchTerm, result, counter } = this.state;

    if (!result) { return null; }

    return (
      <div className="page">
        <h1>{counter}</h1>
        <div
          className="interactions">
          <Search
            value={searchTerm}
            onChange={this.onSearchChange}
          >
            Search
          </Search>
        </div>
        <Table
          list={result.hits}
          pattern={searchTerm}
          onDismiss={this.onDismiss}
        />
      </div>
    );
  }
}

const Search = ({value, onChange, children}) => {
  return (
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

const Table = ({list, pattern, onDismiss}) => {
  return (
    <div className="table">
      {list.filter(isSearched(pattern)).map(item =>
        <div key={item.objectID}
             className="table-row">
            <span>
              <a href={item.url}> {item.title}</a>
            </span>
          <span> {item.author}</span>
          <span> {item.num_comments}</span>
          <span> {item.points}</span>
          <span>
              <Button onClick={() => onDismiss(item.objectID)}
                      className="button-inline">
                Dismiss
              </Button>
            </span>
        </div>
      )}
    </div>
  );
}

const Button = ({onClick, className = '', children}) => {
  return (
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