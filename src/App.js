import React, {Component} from 'react';
import fetch from 'isomorphic-fetch';
import {sortBy} from 'lodash';
import FontAwesome from 'react-fontawesome';
import classNames from 'classnames';

import './App.css';

const DEFAULT_QUERY = 'redux';
const DEFAULT_HPP = '100';

const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';

const SORTS = {
  NONE: list => list,
  TITLE: list => sortBy(list, 'title'),
  AUTHOR: list => sortBy(list, 'author'),
  COMMENTS: list => sortBy(list, 'num_comments').reverse(),
  POINTS: list => sortBy(list, 'points').reverse(),
};

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      results: null,
      searchKey: '',
      counter: 0,
      searchTerm: DEFAULT_QUERY,
      error: null,
      isLoading: false,
    };

    this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this);
    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.onDismiss = this.onDismiss.bind(this);

  }

  needsToSearchTopStories(searchTerm) {
    return !this.state.results[searchTerm];
  }

  onSearchSubmit(event) {
    const {searchTerm} = this.state;

    this.setState({searchKey: searchTerm});
    if (this.needsToSearchTopStories(searchTerm)) {
      this.fetchSearchTopStories(searchTerm);
    }
    event.preventDefault();
  }

  setSearchTopStories(result) {
    const {hits, page} = result;
    const {searchKey, results} = this.state;

    const oldHits = results && results[searchKey]
      ? results[searchKey].hits
      : [];

    const updatedHits = [
      ...oldHits,
      ...hits,
    ];

    this.setState({
      results: {
        ...results,
        [searchKey]: {hits: updatedHits, page}
      },
      isLoading: false
    });
  }

  fetchSearchTopStories(searchTerm, page = 0) {
    this.setState({isLoading: true});

    fetch(`${PATH_BASE}${PATH_SEARCH}` +
      `?${PARAM_SEARCH}${searchTerm}` +
      `&${PARAM_PAGE}${page}` +
      `&${PARAM_HPP}${DEFAULT_HPP}`)
      .then(response => response.json())
      .then(result => this.setSearchTopStories(result))
      .catch(e => this.setState({error: e}));
  }

  componentDidMount() {
    const {searchTerm} = this.state;
    this.setState({searchKey: searchTerm});
    this.fetchSearchTopStories(searchTerm);
  }

  onDismiss(id) {
    const {searchKey, results} = this.state;
    const {hits, page} = results[searchKey];

    const isNotId = item => item.objectID !== id;
    const updatedHits = hits.filter(isNotId);
    const updatedCounter = this.state.counter + 1;
    this.setState({
      // result: Object.assign({}, this.state.result, {hits: updatedHits}),
      // spread syntax alternative (not yet in ES6):
      results: {
        ...results,
        [searchKey]: {hits: updatedHits, page}
      },
      counter: updatedCounter
    });
  }

  onSearchChange(event) {
    this.setState({searchTerm: event.target.value});
  }

  render() {
    const {
      searchTerm,
      results,
      searchKey,
      counter,
      error,
      isLoading,
    } = this.state;

    const page = (results &&
      results[searchKey] &&
      results[searchKey].page)
      || 0;

    const list = (
      results &&
      results[searchKey] &&
      results[searchKey].hits)
      || [];

    return (
      <div className="page">
        <h1>Items dismissed: {counter}</h1>
        <div
          className="interactions">
          <Search
            value={searchTerm}
            onChange={this.onSearchChange}
            onSubmit={this.onSearchSubmit}
          >
            Search
          </Search>
        </div>
        {error
          ? <div className="interactions">
            <p>Something went wrong.</p>
          </div>
          : <div>
            <Table
              list={list}
              onDismiss={this.onDismiss}
            />
            <div className="interactions">
              <ButtonWithLoading
                isLoading={isLoading}
                onClick={() => this.fetchSearchTopStories(searchKey, page + 1)}>
                <h2>More...</h2>
              </ButtonWithLoading>
            </div>
          </div>
        }

      </div>
    );
  }
}

class Search extends Component {
  moveCaretAtEnd(e) {
    var temp_value = e.target.value
    e.target.value = ''
    e.target.value = temp_value
  }

  componentDidMount() {
    if (this.input) {
      this.input.focus();
    }
  }

  render() {
    const {
      value,
      onChange,
      onSubmit,
      children
    } = this.props;

    return (
      <form onSubmit={onSubmit}>
        {children}
        <input
          type="text"
          value={value}
          onChange={onChange}
          ref={(node) => {
            this.input = node;
          }}
          onFocus={this.moveCaretAtEnd}
        />
        <button type="submit">
          {children}
        </button>
      </form>
    );
  }
}

class Table extends Component {
  constructor(props){
    super(props);

    this.state = {
      sortKey: 'NONE',
      isSortReverse: false,
    };

    this.onSort = this.onSort.bind(this);
  }

  onSort(sortKey) {
    const isSortReverse = this.state.sortKey === sortKey && !this.state.isSortReverse;
    this.setState({sortKey, isSortReverse});
  }

  render() {
    const {
      list,
      onDismiss,
    } = this.props;

    const {
      sortKey,
      isSortReverse,
    } =this.state;

    const sortedList = SORTS[sortKey](list);

    const reverseSortedList = isSortReverse
      ? sortedList.reverse()
      : sortedList;

    return (
      <div className="table">
        <div className="table-header">
        <span style={{width: '27%'}}>
          <Sort
            sortKey={'TITLE'}
            onSort={this.onSort}
            activeSortKey={sortKey}>
            Title
            {sortKey === 'TITLE'
              ? (isSortReverse
                  ? <FontAwesome name="arrow-down"/>
                  : <FontAwesome name="arrow-up"/>
              ) : null
            }
          </Sort>
        </span>
          <span style={{width: '27%'}}>
          <Sort
            sortKey={'AUTHOR'}
            onSort={this.onSort}
            activeSortKey={sortKey}>
            Author
            {sortKey === 'AUTHOR'
              ? (isSortReverse
                  ? <FontAwesome name="arrow-down"/>
                  : <FontAwesome name="arrow-up"/>
              ) : null
            }
          </Sort>
        </span>
          <span style={{width: '8%'}}>
          <Sort
            sortKey={'COMMENTS'}
            onSort={this.onSort}
            activeSortKey={sortKey}>
            Comments
            {sortKey === 'COMMENTS'
              ? (isSortReverse
                  ? <FontAwesome name="arrow-up"/>
                  : <FontAwesome name="arrow-down"/>
              ) : null
            }
          </Sort>
        </span>
          <span style={{width: '29%'}}>
          <Sort
            sortKey={'POINTS'}
            onSort={this.onSort}
            activeSortKey={sortKey}>
            Points
            {sortKey === 'POINTS'
              ? (isSortReverse
                  ? <FontAwesome name="arrow-up"/>
                  : <FontAwesome name="arrow-down"/>
              ) : null
            }
          </Sort>
        </span>
        </div>
        {reverseSortedList.map(item =>
          <div key={item.objectID}
               className="table-row">
            <span style={{width: '30%'}}>
              <a href={item.url}> {item.title}</a>
            </span>
            <span style={{width: '30%'}}> {item.author}</span>
            <span style={{width: '10%'}}> {item.num_comments}</span>
            <span style={{width: '10%'}}> {item.points}</span>
            <span>
            <Button onClick={() => onDismiss(item.objectID)}
                    className="button-inline-dismiss">
              Dismiss
            </Button>
          </span>
          </div>
        )}
      </div>
    );
  }
}

const Button = ({onClick, className = '', children}) => {
  return (
    <button
      onClick={onClick}
      className={className}
      type="button"
    >
      {children}
    </button>
  );
}

const Loading = () => {
  return (
    <FontAwesome
      name="spinner"
      size="2x"
      spin
    />
  )
}

const withLoading = (Component) => ({isLoading, ...rest}) =>
  isLoading
    ? <Loading/>
    : <Component {...rest} />

const ButtonWithLoading = withLoading(Button);

const Sort = ({
                sortKey,
                activeSortKey,
                onSort,
                isSortReverse,
                children,
              }) => {
  const sortClass = classNames(
    'button-inline',
    {'button-active': sortKey === activeSortKey}
  );

  return (
    <Button
      onClick={() => onSort(sortKey)}
      className={sortClass}
    >
      {children}
    </Button>
  );
}

export default App;

export {
  Button,
  Search,
  Table,
  Loading
};
