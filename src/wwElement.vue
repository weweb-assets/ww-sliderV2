<template>
    <div class="element-container" :style="cssVariables" :class="{ editing: isEditing, selected: isSelected }">
        <div class="swiper" :data-swiper-id="uniqueID">
            <wwLayout disable-drag-drop="true" path="mainLayoutContent" class="swiper-wrapper">
                <template #default="{ item }">
                    <wwLayoutItem class="swiper-slide">
                        <wwElement class="slide-container" v-bind="item" />
                    </wwLayoutItem>
                </template>
            </wwLayout>
        </div>

        <div v-show="content.pagination" class="bullets">
            <div
                v-for="index in numberOfBullets"
                :key="index"
                class="bullet-container"
                @click="onBulletClick(index - 1)"
            >
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
import Swiper, { EffectFlip, EffectFade, EffectCreative, EffectCoverflow, EffectCube, EffectCards } from 'swiper';
import 'swiper/swiper.min.css';
import 'swiper/modules/effect-fade/effect-fade.min.css';
import 'swiper/modules/effect-creative/effect-creative.min.css';
import 'swiper/modules/effect-coverflow/effect-coverflow.min.css';
import 'swiper/modules/effect-cards/effect-cards.min.css';
import 'swiper/modules/effect-flip/effect-flip.min.css';
import 'swiper/modules/effect-cube/effect-cube.min.css';

export default {
    props: {
        content: { type: Object, required: true },
        /* wwEditor:start */
        wwEditorState: { type: Object, required: true },
        /* wwEditor:end */
    },
    emits: ['update:content', 'update:sidepanel-content'],
    setup() {
        return {
            swiperInstance: null,
        };
    },
    data() {
        return {
            sliderIndex: 0,
            uniqueID: wwLib.wwUtils.getUniqueId(),
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
        isLoop() {
            return this.content.automatic || this.content.loop;
        },
        showLeftNav() {
            const hasPrevious = this.sliderIndex > 0 || this.isLoop;
            return this.content.navigation && hasPrevious;
        },
        showRightNav() {
            const hasNext = this.sliderIndex < this.nbOfSlides - 1 || this.isLoop;
            return this.content.navigation && hasNext;
        },
        numberOfBullets() {
            return Math.ceil(this.nbOfSlides - this.slidesPerView + 1);
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
        slidesPerView() {
            if (this.content.slidesPerView > this.nbOfSlides) {
                return this.nbOfSlides;
            } else if (this.content.slidesPerView < 1) {
                return 1;
            } else {
                return this.content.slidesPerView;
            }
        },
        swiperOptions() {
            return {
                modules: [EffectFlip, EffectFade, EffectCreative, EffectCoverflow, EffectCube, EffectCards],
                effect: this.content.effect,
                creativeEffect: this.creativeEffect,
                slidesPerView: this.slidesPerView,
                spaceBetween: parseInt(this.content.spaceBetween.slice(0, -2)),
                loop: this.isLoop,
                allowTouchMove: !this.isEditing,
                freeMode: this.content.linearTransition,
            };
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
            this.initSwiper();
            if (this.content.automatic && !this.isEditing) {
                this.startAutomate();
            } else if (this.isEditing) {
                this.stopAutomate();
            }
        },
        'wwEditorState.sidepanelContent.slideIndex'(index) {
            if (this.sliderIndex !== index) this.slideTo(index);
        },
        sliderIndex(index) {
            if (this.wwEditorState.sidepanelContent.slideIndex !== index) {
                this.$emit('update:sidepanel-content', { path: 'slideIndex', value: index });
            }
        },
        swiperOptions() {
            this.initSwiper();
        },
        'content.mainLayoutContent'() {
            this.$nextTick(() => {
                this.initSwiper();
            });
        },
        /* wwEditor:end */
    },
    mounted() {
        this.initSwiper(false);
        /* wwFront:start */
        if (this.content.automatic) {
            this.startAutomate();
        }
        /* wwFront:start */
    },
    beforeUnmount() {
        if (this.swiperInstance) this.swiperInstance.destroy(true, true);
        if (this.intervalHolder) clearInterval(this.intervalHolder);
    },
    methods: {
        initSwiper(resetIndex = true) {
            if (this.swiperInstance) this.swiperInstance.destroy(true, true);
            this.swiperInstance = new Swiper(`[data-swiper-id="${this.uniqueID}"]`, this.swiperOptions);
            this.sliderIndex = this.swiperInstance.activeIndex;
            this.swiperInstance.on('activeIndexChange', () => {
                this.sliderIndex = this.swiperInstance.activeIndex;
            });
            if (resetIndex) this.slideTo(0);
        },
        /* wwEditor:start */
        async addSlide() {
            const mainLayoutContent = [...this.content.mainLayoutContent];

            if (mainLayoutContent.length === 0) {
                const slide = await wwLib.createElement('ww-flexbox');
                mainLayoutContent.push(slide);
            } else {
                const slide = await wwLib.wwObjectHelper.cloneElement(
                    mainLayoutContent[mainLayoutContent.length - 1].uid
                );
                mainLayoutContent.push(slide);
            }
            this.$emit('update:content', { mainLayoutContent });
        },
        removeSlide(index) {
            const mainLayoutContent = [...this.content.mainLayoutContent];
            mainLayoutContent.splice(index, 1);

            this.$emit('update:content', { mainLayoutContent });
        },
        /* wwEditor:end */
        slideTo(index) {
            this.swiperInstance.slideTo(index, this.transitionDuration, false);
        },
        onBulletClick(index) {
            if (this.isEditing) return;
            this.slideTo(index);
        },
        slideNext() {
            if (this.isEditing) return;
            this.swiperInstance.slideNext(this.transitionDuration);
        },
        slidePrev() {
            if (this.isEditing) return;
            this.swiperInstance.slidePrev(this.transitionDuration);
        },
        startAutomate() {
            this.stopAutomate();
            this.intervalHolder = setInterval(() => {
                this.slideNext();
            }, this.automaticTiming * 1000);
        },
        stopAutomate() {
            if (this.intervalHolder) clearInterval(this.intervalHolder);
            this.intervalHolder = null;
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
.swiper {
    width: 100%;
    height: 100%;
}
.swiper-wrapper {
    position: relative;
    transition-timing-function: var(--timing-function);

    .slide-container {
        width: 100%;
    }
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
    flex-direction: column;
    justify-content: stretch;
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
