// Issue with eslint + high-order components like decorators
/* eslint react/prop-types: 0 */

import React from 'react';

import cx from 'classnames';

import Template from '../components/Template.js';

function headerFooter(ComposedComponent) {
  class HeaderFooter extends React.Component {
    constructor(props) {
      super(props);
      this.handleHeaderClick = this.handleHeaderClick.bind(this);
      this.state = {
        collapsed: props.collapsed
      };
    }
    componentWillMount() {
      this._computeBodyStyle(this.state.collapsed);
      this._computeHeaderFooterElements({
        collapsable: this.props.collapsable,
        collapsed: this.state.collapsed
      });

      this._classNames = {
        root: cx(this.props.cssClasses.root),
        body: cx(this.props.cssClasses.body)
      };
    }
    shouldComponentUpdate(nextProps, nextState) {
      return nextProps.collapsable === false ||
        nextState !== this.state;
    }
    componentWillUpdate(nextProps, nextState) {
      this._computeBodyStyle(nextState.collapsed);
      this._computeHeaderFooterElements({
        collapsable: nextProps.collapsable,
        collapsed: nextState.collapsed
      });
    }
    _getTemplate({type, onClick = null, style = null}) {
      let templates = this.props.templateProps.templates;
      if (!templates || !templates[type]) {
        return null;
      }
      let className = cx(this.props.cssClasses[type], `ais-${type}`);
      return (
        <Template {...this.props.templateProps}
          cssClass={className}
          onClick={onClick}
          style={style}
          templateKey={type}
          transformData={null}
        />
      );
    }
    _computeHeaderFooterElements({collapsable, collapsed}) {
      // Only add header/footer if a template is defined
      this._header = this._getTemplate({
        type: 'header',
        onClick: collapsable === true ? this.handleHeaderClick : null
      });
      this._footer = collapsed ?
        null :
        this._getTemplate({
          type: 'footer'
        });
    }
    _computeBodyStyle(collapsed) {
      this._bodyStyle = collapsed === true ?
        {display: 'none'} :
        null;
    }
    handleHeaderClick() {
      this.setState({
        collapsed: !this.state.collapsed
      });
    }
    render() {
      return (
        <div className={this._classNames.root}>
          {this._header}
          <div className={this._classNames.body} style={this._bodyStyle}>
            <ComposedComponent {...this.props} />
          </div>
          {this._footer}
        </div>
      );
    }
  }

  HeaderFooter.propTypes = {
    collapsable: React.PropTypes.bool,
    cssClasses: React.PropTypes.shape({
      root: React.PropTypes.string,
      header: React.PropTypes.string,
      body: React.PropTypes.string,
      footer: React.PropTypes.string
    }),
    templateProps: React.PropTypes.object
  };

  HeaderFooter.defaultProps = {
    cssClasses: {},
    collapsable: false
  };

  // precise displayName for ease of debugging (react dev tool, react warnings)
  HeaderFooter.displayName = ComposedComponent.name + '-HeaderFooter';

  return HeaderFooter;
}

export default headerFooter;
