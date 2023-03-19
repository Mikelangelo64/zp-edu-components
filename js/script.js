document.addEventListener('DOMContentLoaded', function () {
  const isSafari = () => {
    return (
      ~navigator.userAgent.indexOf('Safari') &&
      navigator.userAgent.indexOf('Chrome') < 0
    );
  };

  const isMobile = {
    Android: function () {
      return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function () {
      return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function () {
      return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function () {
      return navigator.userAgent.match(/Opera mini/i);
    },
    Windows: function () {
      return navigator.userAgent.match(/IEMobile/i);
    },
    any: function () {
      return (
        isMobile.Android() ||
        isMobile.BlackBerry() ||
        isMobile.iOS() ||
        isMobile.Opera() ||
        isMobile.Windows()
      );
    },
  };

  if (isMobile.any()) {
    document.querySelector('body').classList.add('v-mobile');
    document.querySelector('html').classList.add('v-mobile');
    document.body.style.setProperty('--mobile', `none`);
  } else {
    document.querySelector('body').classList.add('v-desk');
    document.querySelector('html').classList.add('v-desk');
    document.body.style.setProperty('--mobile', `block`);
  }

  //normal vh
  const vh = window.innerHeight * 0.01;
  document.body.style.setProperty('--vh', `${vh}px`);

  //categories height
  let categoriesHeight = 'auto';
  const categoriesItems = document.querySelectorAll(
    '.categories-list .categories-list__item'
  );
  const findTheHigherCategory = (categoriesItems, categoriesHeight) => {
    document.body.style.setProperty('--categories-height', 'auto');

    if (categoriesItems.length === 0) {
      return;
    }

    let biggestHeight = 0;

    categoriesItems.forEach((item) => {
      const height = item.getBoundingClientRect().height;
      biggestHeight = biggestHeight < height ? height : biggestHeight;
    });

    categoriesHeight = biggestHeight;
    document.body.style.setProperty(
      '--categories-height',
      `${categoriesHeight}px`
    );
  };
  findTheHigherCategory(categoriesItems, categoriesHeight);

  let prevWindow = document.body.clientWidth;
  window.addEventListener('resize', () => {
    if (prevWindow !== document.body.clientWidth) {
      prevWindow = document.body.clientWidth;
      findTheHigherCategory(categoriesItems, categoriesHeight);
    }
  });

  //change header when scroll
  const header = document.querySelector('.header');
  let isFatHeader = true;

  header &&
    window.addEventListener('scroll', () => {
      if (window.scrollY > 100 && isFatHeader) {
        //console.log(1);
        header.classList.add('_scrolled');
        isFatHeader = false;
        return;
      }

      if (window.scrollY <= 100 && !isFatHeader) {
        header.classList.remove('_scrolled');
        isFatHeader = true;
        return;
      }
    });

  //header big height
  let headerBigHeight = header ? header.getBoundingClientRect().height : 200;
  document.body.style.setProperty('--header-big', `${headerBigHeight}px`);

  window.addEventListener('resize', () => {
    headerBigHeight = header ? header.getBoundingClientRect().height : 200;
    document.body.style.setProperty('--header-big', `${headerBigHeight}px`);
  });

  function lerp(current, target, ease, approximationLeft = 0.001) {
    const val = current * (1 - ease) + target * ease;
    const diff = Math.abs(target - val);
    if (diff <= approximationLeft) {
      return target;
    }
    return val;
  }

  function stopAnimation(idAnimation) {
    cancelAnimationFrame(idAnimation);
  }

  //custom-form-select

  //animationFrame select-pointer
  let selectPointerAnimationId;
  const selectProgress = {
    current: 0,
    target: 0,
  };

  const selectPointerAnimate = (selectPointer, y) => {
    if (!selectPointer) {
      return;
    }
    if (isMobile.any()) {
      //console.log('mobile');
      selectPointer.style.display = 'none';
      return;
    }

    selectProgress.target = y;
    //selectProgress.current = selectProgress.target;
    selectProgress.current = lerp(
      selectProgress.current,
      selectProgress.target,
      0.15,
      0.001
    );
    selectPointer.style.transform = `translateY(${selectProgress.current}px)`;

    if (selectProgress.current === selectProgress.target) {
      cancelAnimationFrame(selectPointerAnimationId);
    } else {
      selectPointerAnimate(selectPointer, y);
    }
  };

  const selects = document.querySelectorAll('.custom-form-select');
  const selectsLength = Array.from(selects).length;

  Array.from(selects).forEach((select, index, selects) => {
    const selectOriginal = select.querySelector('select');
    const selectOriginalLength = selectOriginal.length;
    //console.log(selectOriginal, selectOriginalLength);

    /* For each element, create a new DIV that will act as the selected item: */
    const selectedItem = document.createElement('DIV');
    selectedItem.setAttribute('class', 'select-selected');
    selectedItem.innerHTML =
      selectOriginal.options[selectOriginal.selectedIndex].innerHTML;
    select.appendChild(selectedItem);

    /* For each element, create a new DIV that will contain the option list: */
    const customOptionList = document.createElement('DIV');
    customOptionList.setAttribute('class', 'select-items select-hide');

    if (document.body.clientWidth >= 1200) {
      const selectPointer = document.createElement('span');
      selectPointer.setAttribute('class', 'select-pointer');
      customOptionList.appendChild(selectPointer);

      customOptionList.addEventListener('mousemove', (evt) => {
        const rect = customOptionList.getBoundingClientRect();
        const startY = rect.top;
        const pointerCenter = selectPointer.getBoundingClientRect().height / 2;
        const y = Math.min(
          Math.max(evt.clientY - startY, pointerCenter),
          rect.height - pointerCenter
        );

        const progress = y - pointerCenter;
        //console.log(y);
        selectPointerAnimationId = window.requestAnimationFrame(() =>
          selectPointerAnimate(selectPointer, progress)
        );
      });
    }

    Array.from(selectOriginal).forEach((option, optionsIndex) => {
      /* For each option in the original select element,
    create a new DIV that will act as an option item: */
      const customOption = document.createElement('DIV');
      customOption.innerHTML = selectOriginal.options[optionsIndex].innerHTML;
      customOption.addEventListener('click', function (e) {
        /* When an item is clicked, update the original select box,
        and the selected item: */
        const select = this.parentNode.parentNode.querySelector('select');
        const selectLength = select.length;
        const customSelectedItem = this.parentNode.previousSibling;

        Array.from(select).forEach(
          (optionChange, indexOptionChange, selectArr) => {
            if (selectArr[indexOptionChange].innerHTML === this.innerHTML) {
              selectArr.selectedIndex = indexOptionChange;
              customSelectedItem.innerHTML = this.innerHTML;

              const activeOptions =
                this.parentNode.querySelectorAll('.same-as-selected');
              Array.from(activeOptions).forEach((activeOption) => {
                activeOption.removeAttribute('class');
              });

              this.setAttribute('class', 'same-as-selected');
            }
          }
        );

        customSelectedItem.click();
      });
      customOptionList.appendChild(customOption);
    });

    select.appendChild(customOptionList);
    selectedItem.addEventListener('click', function (e) {
      /* When the select box is clicked, close any other select boxes,
    and open/close the current select box: */
      e.stopPropagation();
      closeAllSelect(this);
      this.nextSibling.classList.toggle('select-hide');
      this.classList.toggle('select-arrow-active');
    });
  });

  function closeAllSelect(element) {
    /* A function that will close all select boxes in the document,
  except the current select box: */
    const arrNo = [];
    const selectItems = document.querySelectorAll('.select-items');
    const selectSelecteds = document.querySelectorAll('.select-selected');

    Array.from(selectSelecteds).forEach((selected, index) => {
      if (element === selected) {
        arrNo.push(index);
      } else {
        selected.classList.remove('selected-arrow-active');
      }
    });

    Array.from(selectItems).forEach((item, index) => {
      if (arrNo.indexOf(index)) {
        item.classList.add('select-hide');
      }
    });
  }

  //search popup
  const searchButton = document.body.querySelector('.header__btn__search');
  const searchPopup = document.body.querySelector('.popup-search');
  const searchCloseButton =
    searchPopup && searchPopup.querySelector('.popup-search__close');

  const openSearchPopup = () => {
    if (!searchPopup) {
      return;
    }
    searchPopup.classList.toggle('_opened');
  };

  const closeSearchPopup = () => {
    searchPopup.classList.remove('_opened');
  };

  searchButton &&
    searchPopup &&
    searchButton.addEventListener('click', openSearchPopup);
  searchCloseButton &&
    searchPopup &&
    searchCloseButton.addEventListener('click', closeSearchPopup);

  //popup
  const makeTimelinePopup = (item) => {
    const popupInner = item.querySelector('.popup__scroll');
    if (!popupInner) {
      return;
    }

    const timelinePopup = gsap.timeline({
      defaults: { duration: 0.3, ease: 'power4.inOut' },
    });
    timelinePopup
      .to(item, { display: 'flex', duration: 0.01 })
      .from(item, { opacity: 0 })
      //.from(popupInner, { x: 30 })
      .to(item, { opacity: 1 });
    //.to(popupInner, { x: 0 }, '<100%');

    return timelinePopup;
  };

  const popupAnimations = {};
  const popups = document.querySelectorAll('.popup');

  if (popups.length !== 0) {
    popups.forEach((popup) => {
      const timeline = makeTimelinePopup(popup);
      timeline.pause();
      popupAnimations[popup.dataset.popupname] = timeline;
    });
  }

  //open popup
  const popupOpenBtns = document.querySelectorAll('.popup-open');

  const openPopup = (evt) => {
    const popupClass = evt.target.dataset.popup;
    const popup = document.querySelector(`[data-popupname=${popupClass}]`);

    console.log(popupAnimations, popupClass, evt.target);
    popupAnimations[popupClass].play();

    popup.classList.add('_opened');
    document.querySelector('html').classList.add('_lock');
    document.querySelector('body').classList.add('_lock');
  };

  if (popupOpenBtns.length !== 0) {
    popupOpenBtns.forEach((item) => {
      item.addEventListener('click', (evt) => {
        evt.preventDefault();
        openPopup(evt);
      });
    });
  }

  //close popup
  const popupCloseBtns = document.querySelectorAll('.popup__close');
  const popupArr = document.querySelectorAll('.popup');

  const closePopup = (popup) => {
    popup.classList.remove('_opened');
    const popupClass = popup.dataset.popupname;
    //console.dir(popup);
    popupAnimations[popupClass].reverse();

    document.querySelector('html').classList.remove('_lock');
    document.querySelector('body').classList.remove('_lock');
  };

  if (popupCloseBtns) {
    Array.from(popupCloseBtns).forEach((item) => {
      item.addEventListener('click', function (evt) {
        evt.preventDefault();
        evt.stopPropagation();
        const popup = this.parentElement.parentElement.parentElement;
        closePopup(popup);
      });
    });
  }

  if (popupArr) {
    Array.from(popupArr).forEach((item) => {
      item.addEventListener('click', function (evt) {
        if (evt.target === this) {
          closePopup(this);
        }
      });
    });

    window.addEventListener('keydown', function (evt) {
      if (evt.keyCode === 27) {
        const popup = document.querySelector('.popup._opened');
        if (popup) {
          closePopup(popup);
        }
      }
    });
  }

  //DEPARTMENT infinity scroll
  const marqueeTimelines = [];
  const departmentListArr = Array.from(
    document.querySelectorAll('[data-list="marquee"]')
  );

  // const globalTimeline = gsap.timeline();
  // //globalTimeline.pause()
  // const departmentList = document.querySelector('[data-list="marquee"]');

  // const departmentListContent =
  //   departmentList && departmentList.firstElementChild;

  // let originalChild =
  //   departmentListContent && departmentListContent.cloneNode(true);
  let isTimelineDeath = false;

  //Make one clone of content
  const makeClone = (content, parent) => {
    if (!content && !parent) {
      return;
    }

    const cloneContent = content.cloneNode(true);
    //const cloneContent = parent.innerHTML;
    parent.append(cloneContent);
    //parent.insertBefore(cloneContent, parent.firstElementChild);
  };

  //get width and gap of list content
  const getWidthWithGap = (item) => {
    if (!item) {
      return null;
    }

    const itemWidth = item.getBoundingClientRect().width;

    const lastChild = item.lastElementChild;
    const gap = getComputedStyle(lastChild).getPropertyValue('margin-left');

    const result = +itemWidth + parseInt(gap, 10);
    //console.log(itemWidth, gap);
    return result;
  };

  //if in list have too few elements add class "_small"
  const isSmallMarque = (marque, content) => {
    if (!marque && !content) {
      return;
    }
    const contentWidth = content.getBoundingClientRect().width;
    const windowWidth = document.body.clientWidth;

    //console.log(contentWidth, windowWidth);
    return contentWidth / windowWidth < 1;
  };

  //make Timeline for list of content
  const makeMarqueeTimeline = (
    item,
    //isReverseSmall = false,
    isReverse = false
  ) => {
    const timeline = gsap.timeline();
    //const translateX = isReverseSmall ? 50 : 100;
    const shift = isReverse ? -getWidthWithGap(item) : getWidthWithGap(item);

    !isReverse &&
      timeline.set(item, {
        translate: `-${100}% 0`,
      });

    timeline.fromTo(
      item,
      { x: 0 },
      {
        x: shift,
        duration: 30,
        ease: 'none',
        repeat: -1,
      }
    );

    return timeline;
  };

  const initMoveMarquee = (marquee, globalTimeline, marqueIndex) => {
    //console.log(globalTimeline);
    isTimelineDeath = false;
    let progress = globalTimeline ? globalTimeline.progress() : 0;
    globalTimeline && globalTimeline.kill();

    const items = marquee.querySelectorAll('.department-list__inner');

    if (items.length === 0) {
      return;
    }

    items.forEach((item, index) => {
      if (isSmallMarque(marquee, item) && index === 0) {
        marquee.classList.add('_small');
      }

      const timeline = makeMarqueeTimeline(item, marqueIndex % 2 == 0);
      globalTimeline.add(timeline, '0s');
      globalTimeline.progress(progress);
    });
  };

  //change marquee on resize window
  const marqueeResize = (
    departmentList,
    departmentListContent,
    globalTimeline,
    index,
    lastIndex,
    originalChild
  ) => {
    // if (document.body.clientWidth <= 550) {
    //   globalTimeline.kill();

    //   if (!isTimelineDeath) {
    //     departmentList.innerHTML = '';
    //     originalChild.style = '';
    //     departmentList.append(originalChild);

    //     if (lastIndex) {
    //       isTimelineDeath = true;
    //     }
    //   }
    //   return;
    // }

    // if (departmentList.children.length === 1) {
    //   makeClone(departmentListContent, departmentList);
    // }
    initMoveMarquee(departmentList, globalTimeline, index);
  };

  if (departmentListArr.length !== 0) {
    departmentListArr.forEach((departmentList, index, arr) => {
      const globalTimeline = gsap.timeline();
      marqueeTimelines.push(globalTimeline);
      //globalTimeline.pause()
      const departmentListContent =
        departmentList && departmentList.firstElementChild;

      let originalChild =
        departmentListContent && departmentListContent.cloneNode(true);

      //if (document.body.clientWidth > 550) {
      makeClone(departmentListContent, departmentList);
      initMoveMarquee(departmentList, globalTimeline, index);

      if (!isMobile.any()) {
        departmentList.addEventListener('mouseenter', () => {
          globalTimeline.pause();
        });

        departmentList.addEventListener('mouseleave', () => {
          globalTimeline.play();
        });
      }
      //} else {
      if (isSmallMarque(departmentList, departmentListContent)) {
        departmentList.classList.add('_small');
      }
      //}

      window.addEventListener('resize', () => {
        marqueeResize(
          departmentList,
          departmentListContent,
          globalTimeline,
          index,
          index === arr.length - 1,
          originalChild
        );
      });
    });
  }

  //footer accordion
  let isMobileTraform = true;
  const accordionBtns = document.querySelectorAll('.footer-navigation__title');
  const accordionSVG = document.querySelectorAll(
    '.footer-navigation__arrow svg path'
  );
  const accordionDetails = document.querySelectorAll(
    '.footer-navigation__inner'
  );
  const animations = [];
  const animationsSVG = [];

  const makeAccordionTimeline = (item) => {
    const timeline = gsap.timeline({
      defaults: { duration: 0.6, ease: 'power4.inOut' },
    });
    timeline.to(item, { height: 'auto' }).to(item, { opacity: 1 }, '<0.3');

    return timeline;
  };

  const makeAccordionTimelineSVG = (item) => {
    const timeline = gsap.timeline({
      defaults: { duration: 0.15 },
    });
    timeline
      .to(item, { d: 'path("M8 1.5 L8 8.5 L8 1.5")' })
      .to(item, { d: 'path("M15 8 L8 1.5 L1 8")' }, '>0.15');

    return timeline;
  };

  if (Array.from(accordionSVG).length !== 0) {
    Array.from(accordionSVG).forEach((item) => {
      const itemAnimation = makeAccordionTimelineSVG(item);
      itemAnimation.pause();
      animationsSVG.push(itemAnimation);
    });
  }
  if (Array.from(accordionDetails).length !== 0) {
    Array.from(accordionDetails).forEach((item) => {
      const itemAnimation = makeAccordionTimeline(item);
      itemAnimation.pause();
      animations.push(itemAnimation);
    });
  }

  const accordionBtnHandler = (evt, item, index, animations, animationsSVG) => {
    evt.preventDefault();
    const parent = item.parentElement;
    if (!parent) {
      return;
    }

    if (Array.from(parent.classList).includes('_active', 0)) {
      if (isSafari()) {
        const svg = item.querySelector('.footer-navigation__arrow svg');
        if (svg) {
          svg.classList.remove('_active');
        }
      } else {
        animationsSVG[index].reverse();
      }
      animations[index].reverse();
    } else {
      if (isSafari()) {
        const svg = item.querySelector('.footer-navigation__arrow svg');
        if (svg) {
          svg.classList.add('_active');
        }
      } else {
        animationsSVG[index].play();
      }
      animations[index].play();
    }
    parent.classList.toggle('_active');
  };

  accordionBtns.forEach((item, index) => {
    item.addEventListener('click', (evt) => {
      if (document.body.clientWidth < 900) {
        accordionBtnHandler(evt, item, index, animations, animationsSVG);
        isMobileTraform = true;
      }
    });
  });

  //resize list default
  window.addEventListener('resize', () => {
    if (
      document.body.clientWidth >= 900 &&
      accordionDetails.length !== 0 &&
      accordionSVG.length !== 0 &&
      isMobileTraform
    ) {
      accordionDetails.forEach((item, index) => {
        if (!item.parentElement.classList.contains('_active')) {
          item.style = '';
        } else {
          animations[index].progress(1);
        }
      });

      accordionSVG.forEach((item, index) => {
        if (!item.parentElement.classList.contains('_active')) {
          item.style = '';
        } else {
          animationsSVG[index].progress(1);
        }
      });
      isMobileTraform = false;
      return;
    }
    if (
      document.body.clientWidth < 900 &&
      !isMobileTraform &&
      accordionDetails.length !== 0 &&
      accordionSVG.length !== 0
    ) {
      accordionDetails.forEach((item, index) => {
        if (item.parentElement.classList.contains('_active')) {
          animations[index].progress(0);
          animationsSVG[index].progress(0);
        }
      });
      isMobileTraform = true;
    }
  });

  //swipers
  const swiperNews = new Swiper('.news-slider.swiper', {
    navigation: {
      nextEl: '.news__buttons__slider__container .news-slider-next',
      prevEl: '.news__buttons__slider__container .news-slider-prev',
    },

    slidesPerView: 1,
    spaceBetween: 30,

    breakpoints: {
      550: {
        slidesPerView: 2,
      },
      899: {
        slidesPerView: 3,
      },
      1199: {
        slidesPerView: 3,
      },
    },
  });

  const separateSections = document.querySelectorAll(
    '[data-with-separate] .separate'
  );
  const separateContainers = document.querySelectorAll(
    '[data-with-separate] [data-active-slide]'
  );
  const separateSlidersArray = [];

  if (separateSections.length !== 0 && separateContainers.length !== 0) {
    //initialize sliders
    separateSections.forEach((separate) => {
      const slider = separate.querySelector('.separate-slider.swiper');
      if (!slider) {
        return;
      }

      const paginationContainer = separate.querySelector(
        '.separate-header .separate-header__wrapper'
      );
      if (!paginationContainer) {
        return;
      }

      const bulletContentArray =
        paginationContainer.querySelectorAll('.separate-bullet');
      if (bulletContentArray.length === 0) {
        return;
      }

      const swiperInit = new Swiper(slider, {
        effect: 'fade',
        autoHeight: true,
        allowTouchMove: true,
        pagination: {
          el: paginationContainer,
          clickable: true,
          renderBullet: function (index, className) {
            return `
                <button class="${className} separate-bullet">
                    ${
                      bulletContentArray[index]
                        ? bulletContentArray[index].innerHTML
                        : 'Рубрика'
                    }
                </button>
              `;
          },
        },

        slidesPerView: 1,
        spaceBetween: 30,
      });

      separateSlidersArray.push(swiperInit);
    });

    //change bg of wrappers
    separateSlidersArray.forEach((slider, index) => {
      slider.on('slideChange', function () {
        const activeSlideCount = this.activeIndex;
        separateContainers[index].dataset.activeSlide =
          activeSlideCount % 2 === 0 ? 'even' : 'odd';
      });
    });
  }

  const sliderImgContainers = document.querySelectorAll(
    '.slider-img-container'
  );
  const initSliders = [];

  if (sliderImgContainers.length !== 0) {
    sliderImgContainers.forEach((container) => {
      const slider = container.querySelector('.slider-img');
      if (!slider) {
        return;
      }

      const paginationContainer = container.querySelector(
        '.slider-img-pagination'
      );

      const navigationPrev = container.querySelector('.slider-img-prev');
      const navigationNext = container.querySelector('.slider-img-next');

      if (!paginationContainer || !navigationPrev || !navigationNext) {
        return;
      }

      //if pagination counter
      const isCounter = !!slider.dataset.counter;

      //if thumb does exist
      const sliderThumb = container.querySelector('.slider-img-thumb');
      let swiperInitThumb;
      if (sliderThumb) {
        swiperInitThumb = new Swiper(sliderThumb, {
          slidesPerView: 3,
          spaceBetween: 10,

          breakpoints: {
            899: {
              slidesPerView: 5,
              spaceBetween: 30,
            },
          },
        });
      }

      const swiperInit = new Swiper(slider, {
        thumbs: {
          swiper: swiperInitThumb && swiperInitThumb,
        },

        pagination: {
          el: paginationContainer,
          clickable: true,
          type: isCounter ? 'fraction' : 'bullets',
        },
        navigation: {
          nextEl: navigationNext,
          prevEl: navigationPrev,
        },

        slidesPerView: 1,
        spaceBetween: 30,
      });

      initSliders.push(swiperInit);
    });
  }
});
