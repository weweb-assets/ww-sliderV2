<template>
    <div class="element-container" :style="cssVariables" :class="{ editing: isEditing, selected: isSelected }">
        <div class="swiper-container" :class="'swiper-free-mode ' + 'unique-swipper-container-' + uniqueID">
            <wwLayout disable-drag-drop="true" path="mainLayoutContent" class="swiper-wrapper">
                <template #default="{ item }">
                    <wwLayoutItem class="swiper-slide">
                        <wwElement class="slide-container" v-bind="item" />
                    </wwLayoutItem>
                </template>
            </wwLayout>
        </div>

        <div v-show="content.pagination" class="bullets">
            <div v-for="index in Math.ceil(bullets)" :key="index" class="bullet-container" @click="slideTo(index - 1)">
                <wwElement
                    class="bulletIcon"
                    v-bind="content.bulletsIcons"
                    :states="index - 1 === sliderIndex ? ['active', 'Current Slide'] : []"
                />
            </div>
        </div>
        <div v-show="showLeftNav" class="navigation-container prev" @click="slidePrev">
            <wwElement class="layout-prev" v-bind="content.navigationIcons[0]" />
        </div>
        <div v-show="showRightNav" class="navigation-container next" @click="slideNext">
            <wwElement class="layout-next" v-bind="content.navigationIcons[1]" />
        </div>

        <!-- wwEditor:start -->
        <div class="element-container__status label-xs">Slide {{ sliderIndex + 1 }}</div>
        <div class="element-container__menu">
            <wwEditorIcon small name="slider" />
        </div>
        <!-- wwEditor:end -->
    </div>
</template>

<script>
import Swiper from 'swiper/bundle';
import 'swiper/swiper-bundle.css';

export default {
    props: {
        content: { type: Object, required: true },
        /* wwEditor:start */
        wwEditorState: { type: Object, required: true },
        /* wwEditor:end */
    },
    emits: ['update:content'],
    data() {
        return {
            swiperInstance: null,
            slidesLength: 0,
            sliderIndex: 0,
            uniqueID: 0,
            intervalHolder: null,
        };
    },
    computed: {
        isEditing() {
            /* wwEditor:start */
            return this.wwEditorState.editMode === wwLib.wwEditorHelper.EDIT_MODES.EDITION;
            /* wwEditor:end */
            // eslint-disable-next-line no-unreachable
            return false;
        },
        isSelected() {
            /* wwEditor:start */
            return this.wwEditorState.isSelected;
            /* wwEditor:end */
            // eslint-disable-next-line no-unreachable
            return false;
        },
        nbOfSlides() {
            return this.content.mainLayoutContent.length;
        },
        showLeftNav() {
            const isFirst = this.sliderIndex > 0 || this.content.loop;

            return this.content.navigation && isFirst;
        },
        showRightNav() {
            const isLast = this.sliderIndex < this.nbOfSlides - 1 || this.content.loop;

            return this.content.navigation && isLast;
        },
        bullets() {
            return this.nbOfSlides - this.content.slidesPerView + 1;
        },
        transitionDuration() {
            let value = this.content.transitionDuration;
            value = value.substring(0, value.length - 2);
            return parseInt(value);
        },
        automaticTiming() {
            let value = this.content.automaticTiming;
            value = value.substring(0, value.length - 1);
            return parseInt(value);
        },
        handleSlidePerView() {
            if (this.content.slidesPerView > this.nbOfSlides) {
                return this.nbOfSlides;
            } else if (this.content.slidesPerView < 1) {
                return 1;
            } else {
                return this.content.slidesPerView;
            }
        },
        cssVariables() {
            return {
                '--timing-function': this.content.linearTransition ? 'linear' : 'auto',
            };
        },
    },
    watch: {
        /* wwEditor:start */
        isEditing() {
            this.swiperInstance.destroy(true, true);
            this.initSwiper();
        },
        'wwEditorState.sidepanelContent.slideIndex'(index) {
            this.swiperInstance.destroy(true, true);
            this.initSwiper();
            this.currentSlide = index;

            this.swiperInstance.slideTo(this.currentSlide, 0, false);
        },
        'content.direction'() {
            this.swiperInstance.destroy(true, true);
            this.initSwiper();
        },
        'content.effect'() {
            this.swiperInstance.destroy(true, true);
            this.initSwiper();
        },
        'content.slidesPerView'() {
            this.swiperInstance.destroy(true, true);

            if (this.content.slidesPerView > this.nbOfSlides) {
                this.$emit('update:content', { slidesPerView: this.nbOfSlides });
            } else if (this.content.slidesPerView < 1) {
                this.$emit('update:content', { slidesPerView: 1 });
            }

            setTimeout(() => {
                this.initSwiper();
            }, 100);
        },
        'content.spaceBetween'() {
            this.swiperInstance.destroy(true, true);
            this.initSwiper();
        },
        'content.loop'() {
            this.swiperInstance.destroy(true, true);
            if (!this.content.loop) {
                this.$emit('update:content', { automatic: false });
            }
            this.initSwiper();
        },
        'content.automaticTiming'() {
            this.swiperInstance.destroy(true, true);
            if (this.content.automatic) {
                this.$emit('update:content', { loop: true });
                this.automate();
            } else {
                this.$emit('update:content', { loop: false });
                clearInterval(this.intervalHolder);
            }
            this.initSwiper();
        },
        'content.automatic'() {
            this.swiperInstance.destroy(true, true);
            this.$nextTick(() => {
                if (this.content.automatic) {
                    this.$emit('update:content', { loop: true });
                    this.automate();
                } else {
                    this.$emit('update:content', { loop: false });
                    clearInterval(this.intervalHolder);
                }
                this.initSwiper();
            });
        },
        /* wwEditor:end */
    },
    mounted() {
        this.initSwiper();
        if (this.content.automatic) {
            this.automate();
        }
    },
    created() {
        this.uniqueID = wwLib.wwUtils.getUniqueId();
    },
    methods: {
        initSwiper() {
            this.swiperInstance = new Swiper(`.unique-swipper-container-${this.uniqueID}`, {
                effect: this.content.effect,
                fadeEffect:
                    this.content.effect === 'fade'
                        ? {
                              crossFade: true,
                          }
                        : null,
                slidesPerView: this.handleSlidePerView,
                spaceBetween: parseInt(this.content.spaceBetween.slice(0, -2)),
                loop: this.content.loop,
                allowTouchMove: this.isEditing ? false : true,
                freeMode: this.content.linearTransition ? true : false,
            });
            try {
                if (this.swiperInstance) {
                    this.sliderIndex = this.swiperInstance.realIndex;
                    this.swiperInstance.on('activeIndexChange', () => {
                        this.sliderIndex = this.swiperInstance.realIndex;
                    });
                }
            } catch (error) {
                wwLib.wwLog.error('Slider instance not found:', error);
            }
        },
        /* wwEditor:start */
        async addSlide() {
            const mainLayoutContent = [...this.content.mainLayoutContent];

            if (mainLayoutContent.length === 0) {
                const slide = await wwLib.createElememt('ww-flexbox');
                mainLayoutContent.push(slide);
            } else {
                const slide = await wwLib.wwObjectHelper.cloneElement(
                    mainLayoutContent[mainLayoutContent.length - 1].uid
                );
                mainLayoutContent.push(slide);
            }

            this.$emit('update:content', { mainLayoutContent });
            this.initSwiper();
        },
        removeSlide(index) {
            const mainLayoutContent = [...this.content.mainLayoutContent];
            mainLayoutContent.splice(index, 1);

            this.$emit('update:content', { mainLayoutContent });
            this.initSwiper();
        },
        /* wwEditor:end */
        slideTo(index) {
            this.swiperInstance.slideTo(index, this.transitionDuration, false);
        },
        slideNext() {
            if (this.isEditing) return;
            this.swiperInstance.slideNext(this.transitionDuration);
        },
        slidePrev() {
            if (this.isEditing) return;
            this.swiperInstance.slidePrev(this.transitionDuration);
        },
        automate() {
            this.intervalHolder = setInterval(() => {
                this.slideNext();
            }, this.automaticTiming * 1000);
        },
    },
};
</script>

<style lang="scss" scoped>
.element-container {
    position: relative;

    .bullets {
        pointer-events: all;
        position: absolute;
        bottom: 0px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 2;
        display: flex;
        flex-direction: row;
        .bullet-container {
            height: 20px;
        }
    }

    /* wwEditor:start */
    &__status {
        position: absolute;
        top: -1px;
        color: var(--ww-color-white);
        padding: var(--ww-spacing-00) var(--ww-spacing-01);
        border-radius: var(--ww-spacing-00);
        background-color: var(--ww-color-blue-500);
        z-index: 10;
        opacity: 0;
        pointer-events: none;
        right: -1px;
    }
    &.selected {
        > .element-container__status {
            opacity: 1;
            pointer-events: all;
        }
    }
    &.editing:hover {
        & > .border {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border: 1px solid var(--ww-editor-color);
            pointer-events: none;
            z-index: 10;
        }
        > .element-container__menu {
            opacity: 1;
            pointer-events: all;
        }
    }
    &__menu {
        display: flex;
        position: absolute;
        top: 0px;
        left: 5px;
        transform: translate(-50%, -50%);
        border-radius: 100%;
        padding: var(--ww-spacing-01);
        transition: opacity 0.2s ease;
        z-index: 101;
        cursor: pointer;
        background-color: var(--ww-color-blue-500);
        color: var(--ww-color-white);
        justify-content: center;
        align-items: center;
        opacity: 0;
        pointer-events: none;
        &:after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(45deg);
        }
    }
    /* wwEditor:end */
}
.swiper-container {
    width: 100%;
    height: 100%;
}
.swiper-wrapper {
    position: relative;

    .slide-container {
        width: 100%;
    }
}
.swiper-free-mode > .swiper-wrapper {
    transition-timing-function: var(--timing-function);
}
.swiper-slide {
    z-index: 1;
    position: relative;
    text-align: center;
    font-size: 18px;
    /* Center slide text vertically */
    display: -webkit-box;
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    -webkit-justify-content: center;
    justify-content: center;
    -webkit-box-align: center;
    -ms-flex-align: center;
    -webkit-align-items: center;
    align-items: center;
    .slide-layout {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: stretch;
    }
}

.navigation-container {
    width: 100px;
    position: absolute;
    top: 50%;
    
    transform: translateY(-50%);
    z-index: 2;

    &.prev {
        left: 0;
    }
    &.next {
        right: 0;
    }
}
</style>
