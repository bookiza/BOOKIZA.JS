// Copyright Notice: All rights reserved. © 2016 - 2017 Marvin Danig
// FLIPPY VERSION::0.0.1'

// import viewer from '../modules/mode.js'
// import '../modules/graph.js'
// import events from '../modules/events.js'

(((n, w, d, undefined) => {
    /***********************************
     ************* Public API **********
     ***********************************/

    class Book {

        // CONSTRUCTOR

        constructor() {
            this.mode = _viewer.getMatch('(orientation: landscape)') ? 'landscape' : 'portrait'
        }

        // PROPERTIES

        dimensions() {
            return JSON.parse(`{ "width" : "${_book.bounds.width}", "height" : "${_book.bounds.height}" }`)
        }

        view() {
            return _book.currentView
        }

        page() {
            return _book.currentPage
        }

        getLength() {
            return _book.pages.length
        }

        getMode() {
            return _book.mode
        }

        // METHODS
        flipPage(theArgs) {
            let index = parseInt(theArgs[0]) - 1
            if (index.between(0, _book.pages.length)) _flipPage(theArgs[0])
        }

        hasPage(theArgs) {
            let index = parseInt(theArgs[0]) - 1
            return index.between(0, _book.pages.length) ? true : false
        }

        removePage(theArgs) {
            let index = parseInt(theArgs[0]) - 1
            if (index.between(0, _book.pages.length)) _removePage(index)
        }


        addPage(theArgs) {
            let index = parseInt(theArgs[1]) - 1
            if (index.between(0, _book.pages.length)) _addPage(theArgs[0], index)
        }

        // next() {
        //     _next(increment(_book.mode))
        // }

        // previous() {
        //     _previous(increment(_book.mode))
        // }

        // EVENTS


    }

    /***********************************
     ********** Private Methods ********
     ***********************************/

    let _viewer = {
        getMatch(query, usePolyfill) {
            return this.testMedia(query, usePolyfill).matches
        },

        onChange(query, cb, usePolyfill) {
            let res = this.testMedia(query, usePolyfill)

            res.addListener(changed => {
                cb.apply({}, [changed.matches, changed.media])
            })
        },

        testMedia(query, usePolyfill) {
            const isMatchMediaSupported = !!(w && w.matchMedia) && !usePolyfill

            if (isMatchMediaSupported) {
                const res = w.matchMedia(query)
                return res
            } else {
                // ... add polyfill here or use pollyfill.io.
            }
        }
    }


    let _book = new Book()

    function _init(node, settings = { duration: 500, animation: true, curl: true, peel: true, zoom: true }) {
        _book.node = node

        _book.settings = settings

        let nodes = [...node.children]

        _book.buttons = nodes.splice(0, 2)

        _book.pages = nodes.map((page, currentIndex) => {
            return _addBaseClasses(page, currentIndex)
        })

        _setUpGeometry()

        _removeChildren(node)

        _book.currentPage = (settings.start_page === undefined) ? 1 : (parseInt(settings.start_page) > 0 && parseInt(settings.start_page) < parseInt(_book.pages.length)) ? parseInt(settings.start_page) % parseInt(_book.pages.length) : (parseInt(settings.start_page) % parseInt(_book.pages.length) === 0) ? parseInt(_book.pages.length) : parseInt(settings.start_page) < 0 ? parseInt(_book.pages.length) + 1 + parseInt(settings.start_page) % parseInt(_book.pages.length) : parseInt(settings.start_page) % parseInt(_book.pages.length)

        _setView(_book.currentPage)

        _setRange(_book.currentPage)

        _printBook()

        return
    }

    _viewer.onChange('(orientation: landscape)', match => {
        _book.mode = match ? 'landscape' : 'portrait'

        _setView(_book.currentPage)

        _setRange(_book.currentPage)

        _printBook()
    })

    //  Window level listener.

    w.addEventListener('resize', _setUpGeometry)

    function _setUpGeometry() {
        _book.bounds = node.getBoundingClientRect() // Setup a geometrical premise.

        _book.origin = JSON.parse(`{ "x": "${parseInt(d.getElementsByTagName('body')[0].getBoundingClientRect().width) / 2}", "y": "${parseInt(d.getElementsByTagName('body')[0].getBoundingClientRect().height) / 2}" }`)

        console.log(_book.origin)

        d.getElementById('pwidth').textContent = _book.bounds.width
        d.getElementById('pheight').textContent = _book.bounds.height
        d.getElementById('ptop').textContent = _book.bounds.top
        d.getElementById('pleft').textContent = _book.bounds.left
        d.getElementById('pright').textContent = _book.bounds.right
        d.getElementById('pbottom').textContent = _book.bounds.bottom
        d.getElementById('originX').textContent = _book.origin.x
        d.getElementById('originY').textContent = _book.origin.y
    }

    function _removeChildren(node) {
        node.innerHTML = ''
    }

    function _removePage(index) {
        _book.pages.splice(index, 1)

        _setView(_book.currentPage)

        _setRange(_book.currentPage)

        _printBook()

    }

    function _addPage(pageObj, index) {

        let wrappedObj = _addBaseClasses(pageObj, index)

        _book.pages.splice(index, 0, wrappedObj)

        _setView(_book.currentPage)

        _setRange(_book.currentPage)

        _printBook()
    }


    function _addBaseClasses(pageObj, currentIndex) {

        let classes = `promoted inner page-${parseInt(currentIndex) + 1} `

        classes += isEven(currentIndex) ? 'even red' : 'odd blue'

        addClasses(pageObj, classes)

        // return pageObj

        let wrappedHtml = _wrapHtml(pageObj, currentIndex)

        return wrappedHtml
    }

    function _wrapHtml(pageObj, currentIndex) {
        const newWrapper = d.createElement('div')

        let classes = 'wrapper'

        classes += isEven(currentIndex) ? ' odd' : ' even'

        addClasses(newWrapper, classes)

        newWrapper.setAttribute('data-page', parseInt(currentIndex) + 1)

        newWrapper.innerHTML = `<div class="outer gradient"><h1> ${parseInt(currentIndex) + 1}  </h1></div>`

        newWrapper.appendChild(pageObj)

        return newWrapper
    }

    function _flipPage(pageNo) {

        _book.currentPage = pageNo

        _setView(_book.currentPage)

        _setRange(_book.currentPage)

        _printBook()

    }

    function _setView(currentPage = 1) {
        let currentIndex = parseInt(currentPage) - 1

        switch (_book.mode) {
            case 'portrait':
                _book.currentView = [`${currentPage}`]
                _book.viewablePages = [_book.pages[`${currentIndex}`]]
                break

            case 'landscape':
                if (isEven(parseInt(currentPage))) {
                    /***
                        @range = _book.pages.slice(P , Q) where:
                            P & Q are integers
                            P & Q may or may not lie in the range 0 < VALUES < 2N (_book.length)
                    ***/

                    let q = (parseInt(currentPage) + 1) > parseInt(_book.pages.length) ? 1 : (parseInt(currentPage) + 1) % parseInt(_book.pages.length)

                    _book.currentView = [`${currentPage}`, `${q}`]
                    _book.viewablePages = [_book.pages[`${currentIndex}`], _book.pages[`${q - 1}`]]
                } else {
                    let p = (parseInt(currentPage) - 1) < 1 ? _book.pages.length : (parseInt(currentPage) - 1) % parseInt(_book.pages.length)

                    _book.currentView = [`${p}`, `${currentPage}`]
                    _book.viewablePages = [_book.pages[`${p - 1}`], _book.pages[`${currentIndex}`]]
                }

                break
        }

        return
    }

    function _setRange(currentPage = 1) {
        let currentIndex = parseInt(currentPage) - 1

        /***
            @range = _book.pages.slice(P , Q) where:
                P, Q, R, S are integers
                P, Q, R, S may or may not lie in the range 0 < VALUES < 2N (_book.length)
        ***/

        switch (_book.mode) {
            case 'portrait':

                // let p = (currentIndex - 2 < 0) ? parseInt(_book.pages.length) + (currentIndex - 2) : (currentIndex - 2)
                // let q = (currentIndex - 1 < 0) ? parseInt(_book.pages.length) + (currentIndex - 1) : (currentIndex - 1)
                // let r = (currentIndex + 1 >= parseInt(_book.pages.length)) ? (currentIndex + 1) - parseInt(_book.pages.length) : (currentIndex + 1)
                // let s = (currentIndex + 2 >= parseInt(_book.pages.length)) ? (currentIndex + 2) - parseInt(_book.pages.length) : (currentIndex + 2)

                let p = _leftCircularIndex(currentIndex, 2)
                let q = _leftCircularIndex(currentIndex, 1)
                let r = _rightCircularIndex(currentIndex, 1)
                let s = _rightCircularIndex(currentIndex, 2)

                _book.sidePagesLeft = [_book.pages[`${p}`], _book.pages[`${q}`]]
                _book.sidePagesRight = [_book.pages[`${r}`], _book.pages[`${s}`]]

                break

            case 'landscape':
                if (isEven(parseInt(currentPage))) {

                    // let p = (currentIndex - 2 < 0) ? parseInt(_book.pages.length) + (currentIndex - 2) : (currentIndex - 2)
                    // let q = (currentIndex - 1 < 0) ? parseInt(_book.pages.length) + (currentIndex - 1) : (currentIndex - 1)
                    // let r = (currentIndex + 2 >= parseInt(_book.pages.length)) ? (currentIndex + 2) - parseInt(_book.pages.length) : (currentIndex + 2)
                    // let s = (currentIndex + 3 >= parseInt(_book.pages.length)) ? (currentIndex + 3) - parseInt(_book.pages.length) : (currentIndex + 3)


                    let p = _leftCircularIndex(currentIndex, 2)
                    let q = _leftCircularIndex(currentIndex, 1)
                    let r = _rightCircularIndex(currentIndex, 2)
                    let s = _rightCircularIndex(currentIndex, 3)

                    _book.sidePagesLeft = [_book.pages[`${p}`], _book.pages[`${q}`]]
                    _book.sidePagesRight = [_book.pages[`${r}`], _book.pages[`${s}`]]
                } else {

                    // let p = (currentIndex - 3 < 0) ? parseInt(_book.pages.length) + (currentIndex - 3) : (currentIndex - 3)
                    // let q = (currentIndex - 2 < 0) ? parseInt(_book.pages.length) + (currentIndex - 2) : (currentIndex - 2)
                    // let r = (currentIndex + 1 >= parseInt(_book.pages.length)) ? currentIndex + 1 - parseInt(_book.pages.length) + 1 : (currentIndex + 1)
                    // let s = (currentIndex + 2 >= parseInt(_book.pages.length)) ? currentIndex + 1 - parseInt(_book.pages.length) + 1 : (currentIndex + 2)

                    let p = _leftCircularIndex(currentIndex, 3)
                    let q = _leftCircularIndex(currentIndex, 2)
                    let r = _rightCircularIndex(currentIndex, 1)
                    let s = _rightCircularIndex(currentIndex, 2)

                    _book.sidePagesLeft = [_book.pages[`${p}`], _book.pages[`${q}`]]
                    _book.sidePagesRight = [_book.pages[`${r}`], _book.pages[`${s}`]]
                }

                break
        }

        return
    }

    /***********************************
     *********** DOM Printing **********
     ***********************************/

    function _printBook() {
        _printElements('buttons', _book.buttons)

        _printElements('view', _book.viewablePages)

        // _printElements('rightPages', _book.sidePagesRight)

        // _printElements('leftPages', _book.sidePagesLeft)

        _liveBook()

        return
    }

    function _printElements(type, elements) {
        const docfrag = d.createDocumentFragment()

        switch (type) {
            case 'buttons':
                elements.forEach(elem => {
                    docfrag.appendChild(elem)
                })
                break
            case 'view':
                let pageList = elements.map((page, currentIndex) => {
                    return _applyStyles(page, currentIndex, type)
                })

                pageList.forEach(page => {
                    docfrag.appendChild(page)
                })

                break
            case 'rightPages':
                let rightPages = elements.map((page, currentIndex) => {
                    return _applyStyles(page, currentIndex, type)
                })

                rightPages.forEach(page => {
                    docfrag.appendChild(page)
                })

                break
            case 'leftPages':
                let leftPages = elements.map((page, currentIndex) => {
                    return _applyStyles(page, currentIndex, type)
                })

                leftPages.forEach(page => {
                    docfrag.appendChild(page)
                })

                break

        }

        _book.node.appendChild(docfrag) // nodeList?

        return
    }


    function _applyStyles(pageObj, currentIndex, type) {
        let cssString = ''
        switch (_book.mode) {
            case 'portrait':
                switch (type) {
                    case 'view':
                        cssString = 'position: absolute; top: 0; z-index: 2; float: left; left: 0;'

                        pageObj.style.cssText = cssString

                        // cssString += isEven(currentIndex) ? 'float: left; left: 0;' : 'float: right; right: 0; '

                        pageObj.style.cssText = cssString

                        pageObj.id = 'promoted'

                        break
                    case 'rightPages':

                        cssString = 'position: absolute; top: 0; float: left; left: 0; pointer-events:none;'

                        pageObj.style.cssText = cssString

                        cssString += isEven(currentIndex) ? 'z-index: 1; ' : 'z-index: 0;'

                        pageObj.style.cssText = cssString

                        break
                    case 'leftPages':
                        cssString = 'position: absolute; top: 0; float: left; left: 0; pointer-events:none;'

                        pageObj.style.cssText = cssString

                        cssString += isEven(currentIndex) ? 'z-index: 1; ' : 'z-index: 0;'

                        pageObj.style.cssText = cssString

                        break
                }

                break
            case 'landscape':
                switch (type) {
                    case 'view':
                        cssString = 'position: absolute; top: 0; z-index: 3;'

                        pageObj.style.cssText = cssString

                        cssString += isEven(currentIndex) ? 'float: left; left: 0;' : 'float: right; right: 0; '

                        pageObj.style.cssText = cssString

                        break
                    case 'rightPages':
                        cssString = 'float: right; position: absolute; top: 0; right: 0; pointer-events:none;'

                        pageObj.style.cssText = cssString

                        cssString += isEven(currentIndex) ? 'z-index: 2; display: none;' : 'z-index: 1;'

                        pageObj.style.cssText = cssString

                        break
                    case 'leftPages':
                        cssString = 'float: left; position: absolute; top: 0; left: 0; pointer-events:none;'

                        pageObj.style.cssText = cssString

                        cssString += isEven(currentIndex) ? 'z-index: 1; ' : 'z-index: 2; display: none;'

                        pageObj.style.cssText = cssString

                        break

                }
        }
        return pageObj
    }


    /************************************
     *********** DOM/Live book **********
     ************************************/


    // function _next(increment) {
    //     // newCurrentPage = parseInt(_book.currentPage) + parseInt(increment)

    //     // console.log('newCurrentPage', newCurrentPage)
    // }


    // function _previous(increment) {
    //     // newCurrentPage = parseInt(_book.currentPage) + parseInt(increment)

    //     // console.log('newCurrentPage', newCurrentPage)
    // }


    function _liveBook() {

        let livePage = _book.node.querySelectorAll(`[data-page='${parseInt(_book.currentPage)}']`)

        let livePages = _book.node.querySelectorAll(`[data-page]`)


        console.log(livePage, ` and [data-page='${parseInt(_book.currentPage)}']`, livePages)

        return

    }

    /********************************/
    /************ Cone math *********/
    /********************************/

    let π = Math.PI


    // function λ (angle) {

    // }




    /**********************************/
    /********* Events / Touch *********/
    /**********************************/

    //  Book level event listeners.

    let delegateElement = d.getElementById('plotter')

    let handler = (event) => {

        event.stopPropagation()

        event.preventDefault()

        switch (event.type) {
            case 'mousemove':
                _handleMouseMove(event)
                break
            case 'wheel':
                _handleWheelEvent(event)
                break
            case 'mouseover':
                _handleMouseOver(event)
                break
            case 'click':
                _handleMouseClicks(event)
                break
            case 'dblclick':
                _handleMouseDoubleClicks(event)
                break
            case 'mousedown':
                _handleMouseDown(event)
                break
            case 'mouseup':
                _handleMouseUp(event)
                break
            case 'mouseout':
                _handleMouseOut(event)
                break
            case 'touchstart':
                _handleTouchStart(event)
                break
            case 'touchmove':
                _handleTouchMove(event)
                break
            case 'touchend':
                _handleTouchEnd(event)
                break
            default:
                console.log(event)
                break
        }
    }



    let mouseEvents = ['mousemove', 'mouseover', 'mousedown', 'mouseup', 'mouseout', 'click', 'dblclick']

    let touchEvents = ['touchstart', 'touchend', 'touchmove']

    let keyEvents = ['wheel', 'keypress']

    const events = [].concat(mouseEvents).concat(keyEvents)

    if (isTouch()) events.concat(touchEvents)

    events.forEach(event => {
        delegateElement.addEventListener(event, handler)
    })

    function _handleWheelEvent(event) {
        // TODO: Determine forward / backward swipe.

        // console.log(event)

    }

    function _handleMouseMove(event) {
        let eventDoc
        let doc
        let body
        let pageX
        let pageY

        event = event || w.event

        if (event.pageX === null && event.clientX !== null) {
            eventDoc = (event.target && event.target.ownerDocument) || d

            doc = eventDoc.documentElement

            body = eventDoc.body

            event.pageX = event.clientX +
                (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
                (doc && doc.clientLeft || body && body.clientLeft || 0)
            event.pageY = event.clientY +
                (doc && doc.scrollTop || body && body.scrollTop || 0) -
                (doc && doc.clientTop || body && body.clientTop || 0)
        }

        d.getElementById('xaxis').textContent = event.pageX
        d.getElementById('yaxis').textContent = event.pageY
    }


    function _handleMouseClicks(event) {

        if (!event.target) return

        let currentIndex = parseInt(_book.currentPage) - 1

        switch (event.target.nodeName) {
            case 'A':
                switch (_book.mode) {
                    case 'portrait':

                        if (event.target.matches('a#next')) {
                            let increment = 1 // Forward
                            _book.currentPage = _rightCircularIndex(currentIndex, increment) + 1
                        }

                        if (event.target.matches('a#previous')) {
                            let decrement = 1 // Backward
                            _book.currentPage = _leftCircularIndex(currentIndex, decrement) + 1
                        }

                        break
                    case 'landscape':
                        if (event.target.matches('a#next')) {
                            let increment = isEven(_book.currentPage) ? 2 : 1 // Forward
                            _book.currentPage = _rightCircularIndex(currentIndex, increment) + 1
                        }

                        if (event.target.matches('a#previous')) {
                            let decrement = isOdd(_book.currentPage) ? 2 : 1 // Backward
                            _book.currentPage = _leftCircularIndex(currentIndex, decrement) + 1
                        }

                        break
                }


                // _printElements('rightPages', _book.sidePagesRight)

                _setView(_book.currentPage)

                _setRange(_book.currentPage)

                _printBook()

                break
            case 'DIV':
                switch (_book.mode) {
                    case 'portrait':

                        break
                    case 'landscape':
                        if (event.target.matches('div.even')) {
                            console.log('forward')
                            event.target.className += ' flip forward'
                        }
                        if (event.target.matches('div.odd')) {
                            console.log('backward')
                            event.target.className += ' flip backward'
                        }
                        break
                }
                break
            default:
                console.log('WUT', event.target)
                return
        }


    }


    function _handleMouseOver(event) {
        let currentIndex = parseInt(_book.currentPage) - 1

        console.log(event)

        // if (!event.srcElement.getAttribute('page')) return

        let livePage = _book.node.querySelectorAll(`[data-page='${parseInt(_book.currentPage)}']`)

        // event.target.className += ' curl'

        // TODO Trigger a peel?

        switch (_book.mode) {
            case 'portrait':
                let prevPages = [_book.pages[`${ _leftCircularIndex(currentIndex, 3) }`]]
                let nextPages = _rightCircularIndex(currentIndex, 3)

                break
            case 'landscape':
                // console.log(event.srcElement.getAttribute('page'))

                // let leftAppendage = _leftCircularIndex
        }


    }


    function _handleMouseDoubleClicks(event) {
        // console.log('Do you wanna make a snowman?')
    }

    function _handleMouseDown(event) {

    }

    function _handleMouseUp(event) {
        // console.log('Up!')
    }

    function _handleMouseOut(event) {
        // console.log('Out!')
    }

    function _handleTouchStart(event) {
        // console.log('Touch started')
    }

    function _handleTouchMove(event) {
        // console.log('Touch moving')
    }

    function _handleTouchEnd(event) {
        // console.log('Touch moving')
    }


    /* Listen for CSS3 TransitionEnds */

    function whichTransitionEvent() {
        let t
        const el = d.createElement('fakeelement')
        const transitions = {
            'transition': 'transitionend',
            'OTransition': 'oTransitionEnd',
            'MozTransition': 'transitionend',
            'WebkitTransition': 'webkitTransitionEnd'
        }

        for (t in transitions) {
            if (el.style[t] !== undefined) {
                return transitions[t]
            }
        }
    }

    const transitionEvent = whichTransitionEvent()

    transitionEvent && d.addEventListener(transitionEvent, (event) => {
        console.log('yay, transition ended')
        console.log(event.target)
        console.log({ 'height': _book.bounds.height, 'width': _book.bounds.width })
    })


    /**********************************/
    /********* Helper methods *********/
    /**********************************/

    function isEven(n) {
        return n === parseFloat(n) ? !(n % 2) : void 0
    }

    function isOdd(n) {
        return Math.abs(n % 2) == 1
    }

    function isTouch() {
        return (('ontouchstart' in w) || (n.MaxTouchPoints > 0) || (n.msMaxTouchPoints > 0)) // TODO: Do we need this? Consider pointerEvents.
    }

    function _leftCircularIndex(currentIndex, indice) {
        return (parseInt(currentIndex) - parseInt(indice) < 0) ? parseInt(_book.pages.length) + (parseInt(currentIndex) - parseInt(indice)) : (parseInt(currentIndex) - parseInt(indice))
    }

    function _rightCircularIndex(currentIndex, indice) {
        return (parseInt(currentIndex) + parseInt(indice) >= parseInt(_book.pages.length)) ? (parseInt(currentIndex) + parseInt(indice)) - parseInt(_book.pages.length) : (parseInt(currentIndex) + parseInt(indice))
    }

    // function increment(mode) {
    //     return (mode === 'portrait') ? 1 : 2
    // }

    // function direction(mode) {
    //     // return (mode === 'portrait') ? 'forward' : 'backward'
    // }


    /**********************************/
    /************ Polyfills ***********/
    /**********************************/


    DOMTokenList.prototype.addmany = function(classes) {
        var classes = classes.split(' '),
            i = 0,
            ii = classes.length

        for (i; i < ii; i++) {
            this.add(classes[i])
        }
    }

    DOMTokenList.prototype.removemany = function(classes) {
        var classes = classes.split(' '),
            i = 0,
            ii = classes.length

        for (i; i < ii; i++) {
            this.remove(classes[i])
        }
    }

    let addClasses = function(elem, classes) {
        elem.classList.addmany(classes)
    }

    let removeClasses = function(elem, classes) {
        elem.classList.removemany(classes)
    }

    Number.prototype.between = function(min, max) {
        return this > min && this < max
    }


    /**********************************/
    /*********** Exposed API **********/
    /**********************************/

    class Superbook {
        flippy(methodName, ...theArgs) {
            switch (methodName) {
                case 'length':
                    return _book['getLength']()
                    break
                case 'mode':
                    return _book['getMode']()
                    break
                case 'page':
                    if (theArgs.length === 0)
                        return _book['page']()
                    else
                        _book['flipPage'](theArgs)
                    break

                default:
                    return _book[methodName](theArgs)
                    break
            }
        }
    }

    // Putting superbook object in global namespace.
    if (typeof(w.Flippy) === 'undefined') {
        w.Flippy = {
            init(node, settings) {
                _init(node, settings)
                return new Superbook()
            }
        }
    }
}))(navigator, window, document)
