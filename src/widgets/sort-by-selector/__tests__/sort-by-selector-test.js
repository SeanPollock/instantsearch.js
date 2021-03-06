/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import sinon from 'sinon';
import jsdom from 'jsdom-global';

import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

import sortBySelector from '../sort-by-selector';
import Selector from '../../../components/Selector';

describe('sortBySelector call', () => {
  beforeEach(function() {this.jsdom = jsdom();});
  afterEach(function() {this.jsdom();});

  it('throws an exception when no options', () => {
    const container = document.createElement('div');
    expect(sortBySelector.bind(null, {container})).toThrow(/^Usage/);
  });

  it('throws an exception when no indices', () => {
    const indices = [];
    expect(sortBySelector.bind(null, {indices})).toThrow(/^Usage/);
  });
});

describe('sortBySelector()', () => {
  beforeEach(function() {this.jsdom = jsdom();});
  afterEach(function() {this.jsdom();});

  let ReactDOM;
  let container;
  let indices;
  let cssClasses;
  let widget;
  let props;
  let helper;
  let results;
  let autoHideContainer;

  beforeEach(() => {
    autoHideContainer = sinon.stub().returns(Selector);
    ReactDOM = {render: sinon.spy()};

    sortBySelector.__Rewire__('ReactDOM', ReactDOM);
    sortBySelector.__Rewire__('autoHideContainerHOC', autoHideContainer);

    container = document.createElement('div');
    indices = [
      {name: 'index-a', label: 'Index A'},
      {name: 'index-b', label: 'Index B'}
    ];
    cssClasses = {
      root: ['custom-root', 'cx'],
      item: 'custom-item'
    };
    widget = sortBySelector({container, indices, cssClasses});
    helper = {
      getIndex: sinon.stub().returns('index-a'),
      setIndex: sinon.spy(),
      search: sinon.spy()
    };
    results = {
      hits: [],
      nbHits: 0
    };
  });

  it('doesn\'t configure anything', () => {
    expect(widget.getConfiguration).toEqual(undefined);
  });

  it('calls twice ReactDOM.render(<Selector props />, container)', () => {
    widget.render({helper, results});
    widget.render({helper, results});
    props = {
      cssClasses: {
        root: 'ais-sort-by-selector custom-root cx',
        item: 'ais-sort-by-selector--item custom-item'
      },
      currentValue: 'index-a',
      shouldAutoHideContainer: true,
      options: [
        {value: 'index-a', label: 'Index A'},
        {value: 'index-b', label: 'Index B'}
      ],
      setValue: () => {}
    };
    expect(ReactDOM.render.calledTwice).toBe(true, 'ReactDOM.render called twice');
    expect(ReactDOM.render.firstCall.args[0]).toEqualJSX(<Selector {...props} />);
    expect(ReactDOM.render.firstCall.args[1]).toEqual(container);
    expect(ReactDOM.render.secondCall.args[0]).toEqualJSX(<Selector {...props} />);
    expect(ReactDOM.render.secondCall.args[1]).toEqual(container);
  });

  it('sets the underlying index', () => {
    widget.setIndex(helper, 'index-b');
    expect(helper.setIndex.calledOnce).toBe(true, 'setIndex called once');
    expect(helper.search.calledOnce).toBe(true, 'search called once');
  });

  it('should throw if there is no name attribute in a passed object', () => {
    indices.length = 0;
    indices.push({label: 'Label without a name'});
    expect(() => {
      widget.init({helper});
    }).toThrow(/Index index-a not present/);
  });

  it('must include the current index at initialization time', () => {
    helper.getIndex = sinon.stub().returns('non-existing-index');
    expect(() => {
      widget.init({helper});
    }).toThrow(/Index non-existing-index not present/);
  });

  afterEach(() => {
    sortBySelector.__ResetDependency__('ReactDOM');
    sortBySelector.__ResetDependency__('autoHideContainerHOC');
  });
});
