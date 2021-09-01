<template>
    <div class="element-container" :style="cssVariables">
        <div class="swiper-container" :class="'swiper-free-mode ' + 'unique-swipper-container-' + uniqueID">
            <wwLayout
                ww-no-drag-drop="true"
                path="mainLayoutContent"
                class="swiper-wrapper"
                @update:list="handleUpdate($event)"
            >
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
                    :states="index - 1 === sliderIndex ? ['active'] : []"
                />
            </div>
        </div>
        <div v-show="showLeftNav" class="navigation-container" @click="slidePrev">
            <wwElement class="layout-prev" v-bind="content.navigationIcons[0]" />
        </div>
        <div v-show="showRightNav" class="navigation-container" @click="slideNext">
            <wwElement class="layout-next" v-bind="content.navigationIcons[1]" />
        </div>
    </div>
</template>

<script>
import Swiper from 'swiper/bundle';
import 'swiper/swiper-bundle.css';

/* wwEditor:start */
import { getSettingsConfigurations } from './configuration';
/* wwEditor:end */

export default {
    props: {
        content: { type: Object, required: true },
        /* wwEditor:start */
        wwEditorState: { type: Object, required: true },
        /* wwEditor:end */
    },
    emits: ['update:content'],
    wwDefaultContent: {
        slides: {
            items: [
                {
                    checked: true,
                    index: 0,
                },
                {
                    checked: false,
                    index: 1,
                },
                {
                    checked: false,
                    index: 2,
                },
            ],
            target: null,
        },
        slidesContainer: [],
        mainLayoutContent: [wwLib.element('ww-flexbox'), wwLib.element('ww-flexbox'), wwLib.element('ww-flexbox')],
        bulletsLayout: [],
        bulletsLayoutStates: [],
        slidesPerView: wwLib.responsive(1),
        effect: 'slide',
        transitionDuration: '400ms',
        automaticTiming: '3s',
        navigation: true,
        loop: false,
        pagination: true,
        spaceBetween: wwLib.responsive('0px'),
        navigationIcons: [wwLib.element('ww-icon'), wwLib.element('ww-icon')],
        bulletsIcons: wwLib.element('ww-icon'),
        automatic: false,
        linearTransition: false,
    },
    /* wwEditor:start */
    wwEditorConfiguration({ content }) {
        return getSettingsConfigurations(content);
    },
    /* wwEditor:end */
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
        showLeftNav() {
            const isFirst = this.sliderIndex > 0 || this.content.loop;

            return this.content.navigation && isFirst;
        },
        showRightNav() {
            const isLast = this.sliderIndex < this.content.slides.items.length - 1 || this.content.loop;

            return this.content.navigation && isLast;
        },
        bullets() {
            return this.content.slides.items.length - this.content.slidesPerView + 1;
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
        cssVariables() {
            return {
                '--timing-function': this.content.linearTransition ? 'linear' : 'auto',
            };
        },
    },
    watch: {
        'content.slides.items': async function (newValue, oldValue) {
            this.swiperInstance.destroy(true, true);

            if (newValue && oldValue && newValue.length > oldValue.length) {
                const mainLayoutContent = [...this.content.mainLayoutContent];
                if (mainLayoutContent[this.content.slides.items.length - 2]) {
                    mainLayoutContent[this.content.slides.items.length - 1] = await this.cloneElement(
                        mainLayoutContent[this.content.slides.items.length - 2].uid
                    );
                } else {
                    mainLayoutContent[this.content.slides.items.length - 1] = await this.cloneElement(
                        mainLayoutContent[0].uid
                    );
                }

                this.$emit('update:content', { mainLayoutContent });
            }

            if (this.content.slides.target) {
                const mainLayoutContent = [...this.content.mainLayoutContent];
                mainLayoutContent.splice(this.content.slides.target, 1);

                this.$emit('update:content', {
                    mainLayoutContent,
                    slides: { ...this.content.slides, target: null },
                });
            }

            this.$nextTick(() => {
                this.initSwiper();
            });
        },
        isEditing() {
            this.swiperInstance.destroy(true, true);
            this.$nextTick(() => {
                this.initSwiper();
            });
        },
        'content.direction'() {
            this.swiperInstance.destroy(true, true);
            this.$nextTick(() => {
                this.initSwiper();
            });
        },
        'content.effect'() {
            this.swiperInstance.destroy(true, true);
            this.$nextTick(() => {
                this.initSwiper();
            });
        },
        'content.slides'() {
            this.swiperInstance.destroy(true, true);
            this.$nextTick(() => {
                this.initSwiper();
                this.currentSlide = this.content.slides.items.findIndex(item => item.checked);

                this.swiperInstance.slideTo(this.currentSlide, 0, false);
            });
        },
        'content.slidesPerView'() {
            this.swiperInstance.destroy(true, true);
            this.$nextTick(() => {
                this.initSwiper();
            });
        },
        'content.spaceBetween'() {
            this.swiperInstance.destroy(true, true);
            this.$nextTick(() => {
                this.initSwiper();
            });
        },
        'content.loop'() {
            this.swiperInstance.destroy(true, true);
            this.$nextTick(() => {
                if (!this.content.loop) {
                    this.$emit('update:content', { automatic: false });
                }
                this.initSwiper();
            });
        },
        'content.automaticTiming'() {
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
    },
    mounted() {
        this.$emit('update:content', { numberOfSlides: this.content.slides.items.length });
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
                slidesPerView: this.content.slidesPerView,
                spaceBetween: parseInt(this.content.spaceBetween.slice(0, -2)),
                loop: this.content.loop,
                allowTouchMove: this.isEditing ? false : true,
                freeMode: this.content.linearTransition ? true : false,
            });
            try {
                this.$nextTick(() => {
                    this.sliderIndex = this.swiperInstance.realIndex;
                    this.swiperInstance.on('activeIndexChange', () => {
                        this.sliderIndex = this.swiperInstance.realIndex;
                    });
                });
            } catch (error) {
                wwLib.wwLog.error('Slider instance not found:', error);
            }
        },
        handleUpdate(event) {
            console.log(event);

            if (event.type === 'add') {
                const oldSlidesItems = this.content.slides.items;
                const newSlidesItems = [];

                for (let i = 0; i < oldSlidesItems.length + 1; i++) {
                    newSlidesItems.push({
                        checked: i === event.index ? true : false,
                        index: i,
                    });
                }

                const slides = {
                    items: newSlidesItems,
                    target: null,
                };

                this.$emit('update:content', { slides });
                this.slideTo(event.index);
            } else if (event.type === 'remove') {
                const oldSlidesItems = this.content.slides.items;
                const newSlidesItems = [];

                for (let i = 0; i < oldSlidesItems.length - 1; i++) {
                    newSlidesItems.push({
                        checked: i === 0 ? true : false,
                        index: i,
                    });
                }

                const slides = {
                    items: newSlidesItems,
                    target: null,
                };

                this.$emit('update:content', { slides });
            }
        },
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
        async cloneElement(uid) {
            const template = wwLib.$store.getters['websiteData/getFullWwObject'](uid);
            const newWwObjectId = await wwLib.wwObjectHelper.createFromTemplate(template);
            return { isWwObject: true, uid: newWwObjectId };
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
.layout-prev {
    width: 100px;
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    z-index: 2;
}
.layout-next {
    width: 100px;
    position: absolute;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    z-index: 2;
}
</style>
