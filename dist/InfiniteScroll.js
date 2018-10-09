'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var InfiniteScroll = function (_Component) {
  _inherits(InfiniteScroll, _Component);

  function InfiniteScroll(props) {
    _classCallCheck(this, InfiniteScroll);

    var _this = _possibleConstructorReturn(this, (InfiniteScroll.__proto__ || Object.getPrototypeOf(InfiniteScroll)).call(this, props));

    _this.scrollListener = _this.scrollListener.bind(_this);
    _this.defaultLoader = null;
    return _this;
  }

  _createClass(InfiniteScroll, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.pageLoaded = this.props.pageStart;
      this.attachScrollListener();
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      this.attachScrollListener();
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.detachScrollListener();
      this.detachMousewheelListener();
    }
  }, {
    key: 'getScrollableElement',
    value: function getScrollableElement() {
      return this.props.useWindow === false ? this._container : window;
    }
  }, {
    key: 'getParentElement',
    value: function getParentElement() {
      var customParent = this.props.customParent;

      // The parent element can be overriden to make
      // calculations based on a different element.

      if (typeof customParent === 'function') {
        return customParent();
      }

      return this.props.useWindow === false ? this._container.parentNode : window;
    }

    // Set a default loader for all of your InfiniteScroll components.

  }, {
    key: 'setDefaultLoader',
    value: function setDefaultLoader(loader) {
      this.defaultLoader = loader;
    }
  }, {
    key: 'detachMousewheelListener',
    value: function detachMousewheelListener() {
      var useCapture = this.props.useCapture;


      var scrollEl = this.getParentElement();
      scrollEl.removeEventListener('mousewheel', this.mousewheelListener, useCapture);
    }
  }, {
    key: 'detachScrollListener',
    value: function detachScrollListener() {
      var useCapture = this.props.useCapture;


      var scrollEl = this.getParentElement();
      scrollEl.removeEventListener('scroll', this.scrollListener, useCapture);
      scrollEl.removeEventListener('resize', this.scrollListener, useCapture);
    }
  }, {
    key: 'attachScrollListener',
    value: function attachScrollListener() {
      var _props = this.props,
          hasMore = _props.hasMore,
          initialLoad = _props.initialLoad,
          useCapture = _props.useCapture;

      // Don't attach event listeners if we have no more items to load.

      if (!hasMore) {
        return;
      }

      var scrollEl = this.getParentElement();
      scrollEl.addEventListener('mousewheel', this.mousewheelListener, useCapture);
      scrollEl.addEventListener('scroll', this.scrollListener, useCapture);
      scrollEl.addEventListener('resize', this.scrollListener, useCapture);

      if (initialLoad) {
        this.scrollListener();
      }
    }
  }, {
    key: 'mousewheelListener',
    value: function mousewheelListener(e) {
      // Prevents Chrome hangups.
      // See: https://stackoverflow.com/questions/47524205/random-high-content-download-time-in-chrome/47684257#47684257
      if (e.deltaY === 1) {
        e.preventDefault();
      }
    }
  }, {
    key: 'scrollListener',
    value: function scrollListener() {
      var _props2 = this.props,
          direction = _props2.direction,
          loadMore = _props2.loadMore,
          threshold = _props2.threshold,
          useWindow = _props2.useWindow;


      var container = this.getScrollableElement();
      var parent = this.getParentElement();
      var isReverse = this.isReverse(direction);

      var offset = void 0;
      if (useWindow) {
        var doc = document.documentElement || document.body.parentNode || document.body;
        var scrollTop = container.pageYOffset !== undefined ? container.pageYOffset : doc.scrollTop;
        if (isReverse) {
          offset = scrollTop;
        } else {
          offset = this.calculateOffset(container, scrollTop);
        }
      } else if (isReverse) {
        offset = parent.scrollTop;
      } else {
        offset = container.scrollHeight - parent.scrollTop - parent.clientHeight;
      }

      // Here we make sure the element is visible as well as checking the offset.
      if (offset < Number(threshold) && container && container.offsetParent !== null) {
        this.detachScrollListener();
        // Call loadMore after detachScrollListener to
        // allow for non-async loadMore functions.
        if (typeof loadMore === 'function') {
          loadMore(this.pageLoaded += 1);
        }
      }
    }
  }, {
    key: 'calculateOffset',
    value: function calculateOffset(el, scrollTop) {
      if (!el) {
        return 0;
      }

      return this.calculateTopPosition(this._container) + (this._container.offsetHeight - scrollTop - window.innerHeight);
    }
  }, {
    key: 'calculateTopPosition',
    value: function calculateTopPosition(el) {
      if (!el) {
        return 0;
      }
      return el.offsetTop + this.calculateTopPosition(el.offsetParent);
    }
  }, {
    key: 'isReverse',
    value: function isReverse(direction) {
      return direction === 'up';
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props3 = this.props,
          Container = _props3.container,
          children = _props3.children,
          direction = _props3.direction,
          hasMore = _props3.hasMore,
          initialLoad = _props3.initialLoad,
          loader = _props3.loader,
          loaderKey = _props3.loaderKey,
          loadMore = _props3.loadMore,
          pageStart = _props3.pageStart,
          ref = _props3.ref,
          threshold = _props3.threshold,
          useCapture = _props3.useCapture,
          useWindow = _props3.useWindow,
          props = _objectWithoutProperties(_props3, ['container', 'children', 'direction', 'hasMore', 'initialLoad', 'loader', 'loaderKey', 'loadMore', 'pageStart', 'ref', 'threshold', 'useCapture', 'useWindow']);

      var containerRef = function containerRef(node) {
        _this2._container = node;
        if (ref) {
          ref(node);
        }
      };

      var items = [children];
      var isReverse = this.isReverse(direction);
      var Loader = loader || this.defaultLoader;

      return _react2.default.createElement(
        Container,
        _extends({ ref: containerRef }, props),
        loader && hasMore && isReverse && _react2.default.createElement(Loader, { key: loaderKey }),
        items,
        loader && hasMore && !isReverse && _react2.default.createElement(Loader, { key: loaderKey })
      );
    }
  }]);

  return InfiniteScroll;
}(_react.Component);

InfiniteScroll.propTypes = {
  children: _propTypes2.default.node.isRequired,
  container: _propTypes2.default.node,
  customParent: _propTypes2.default.func,
  direction: _propTypes2.default.oneOf(['up', 'down']),
  hasMore: _propTypes2.default.bool,
  initialLoad: _propTypes2.default.bool,
  loader: _propTypes2.default.oneOfType([_propTypes2.default.func, _propTypes2.default.node]),
  loaderKey: _propTypes2.default.any,
  loadMore: _propTypes2.default.func.isRequired,
  pageStart: _propTypes2.default.number,
  ref: _propTypes2.default.func,
  threshold: _propTypes2.default.number,
  useCapture: _propTypes2.default.bool,
  useWindow: _propTypes2.default.bool
};

InfiniteScroll.defaultProps = {
  container: 'div',
  direction: 'down',
  hasMore: false,
  initialLoad: true,
  loader: null,
  loaderKey: 'ISLoader',
  pageStart: 0,
  threshold: 250,
  useCapture: false,
  useWindow: true
};

exports.default = InfiniteScroll;
module.exports = exports['default'];
