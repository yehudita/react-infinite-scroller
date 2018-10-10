import React, { Component } from 'react';
import PropTypes from 'prop-types';

class InfiniteScroll extends Component {
  constructor(props) {
    super(props);

    this.scrollListener = this.scrollListener.bind(this);
    this.defaultLoader = null;
  }

  componentDidMount() {
    this.pageLoaded = this.props.pageStart;
    this.attachScrollListener();
  }

  componentDidUpdate() {
    this.attachScrollListener();
  }

  componentWillUnmount() {
    this.detachScrollListener();
    this.detachMousewheelListener();
  }

  getScrollableElement() {
    return this.props.useWindow === false ? this._container : window;
  }

  getParentElement() {
    const { getScrollParent } = this.props;

    // The parent element can be overriden to make
    // calculations based on a different element.
    if (typeof getScrollParent === 'function') {
      return getScrollParent();
    }

    return this.props.useWindow === false ? this._container.parentNode : window;
  }

  // Set a default loader for all of your InfiniteScroll components.
  setDefaultLoader(loader) {
    this.defaultLoader = loader;
  }

  detachMousewheelListener() {
    const { useCapture } = this.props;

    const scrollEl = this.getParentElement();
    scrollEl.removeEventListener(
      'mousewheel',
      this.mousewheelListener,
      useCapture,
    );
  }

  detachScrollListener() {
    const { useCapture } = this.props;

    const scrollEl = this.getParentElement();
    scrollEl.removeEventListener('scroll', this.scrollListener, useCapture);
    scrollEl.removeEventListener('resize', this.scrollListener, useCapture);
  }

  attachScrollListener() {
    const { hasMore, initialLoad, useCapture } = this.props;

    // Don't attach event listeners if we have no more items to load.
    if (!hasMore) {
      return;
    }

    const scrollEl = this.getParentElement();
    scrollEl.addEventListener(
      'mousewheel',
      this.mousewheelListener,
      useCapture,
    );
    scrollEl.addEventListener('scroll', this.scrollListener, useCapture);
    scrollEl.addEventListener('resize', this.scrollListener, useCapture);

    if (initialLoad) {
      this.scrollListener();
    }
  }

  mousewheelListener(e) {
    // Prevents Chrome hangups.
    // See: https://stackoverflow.com/questions/47524205/random-high-content-download-time-in-chrome/47684257#47684257
    if (e.deltaY === 1) {
      e.preventDefault();
    }
  }

  scrollListener() {
    const { direction, loadMore, threshold, useWindow } = this.props;

    const container = this.getScrollableElement();
    const parent = this.getParentElement();
    const isReverse = this.isReverse(direction);

    let offset;
    if (useWindow) {
      const doc =
        document.documentElement || document.body.parentNode || document.body;
      const scrollTop =
        container.pageYOffset !== undefined
          ? container.pageYOffset
          : doc.scrollTop;
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
    if (
      offset < Number(threshold) &&
      (container && container.offsetParent !== null)
    ) {
      this.detachScrollListener();
      // Call loadMore after detachScrollListener to
      // allow for non-async loadMore functions.
      if (typeof loadMore === 'function') {
        loadMore((this.pageLoaded += 1));
      }
    }
  }

  calculateOffset(el, scrollTop) {
    if (!el) {
      return 0;
    }

    return (
      this.calculateTopPosition(this._container) +
      (this._container.offsetHeight - scrollTop - window.innerHeight)
    );
  }

  calculateTopPosition(el) {
    if (!el) {
      return 0;
    }
    return el.offsetTop + this.calculateTopPosition(el.offsetParent);
  }

  isReverse(direction) {
    return direction === 'up';
  }

  render() {
    const {
      container: Container,
      children,
      direction,
      hasMore,
      initialLoad,
      loader,
      loaderKey,
      loadMore,
      pageStart,
      ref,
      threshold,
      useCapture,
      useWindow,
      ...props
    } = this.props;

    const containerRef = node => {
      this._container = node;
      if (ref) {
        ref(node);
      }
    };

    const items = [children];
    const isReverse = this.isReverse(direction);
    const Loader = loader || this.defaultLoader;

    return (
      <Container ref={containerRef} {...props}>
        {loader && hasMore && isReverse && <Loader key={loaderKey} />}
        {items}
        {loader && hasMore && !isReverse && <Loader key={loaderKey} />}
      </Container>
    );
  }
}

InfiniteScroll.propTypes = {
  children: PropTypes.node.isRequired,
  container: PropTypes.node,
  direction: PropTypes.oneOf(['up', 'down']),
  getScrollParent: PropTypes.func,
  hasMore: PropTypes.bool,
  initialLoad: PropTypes.bool,
  loader: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
  loaderKey: PropTypes.any,
  loadMore: PropTypes.func.isRequired,
  pageStart: PropTypes.number,
  ref: PropTypes.func,
  threshold: PropTypes.number,
  useCapture: PropTypes.bool,
  useWindow: PropTypes.bool,
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
  useWindow: true,
};

export default InfiniteScroll;
