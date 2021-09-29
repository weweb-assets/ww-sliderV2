export default {
    editor: {
        label: {
            en: 'Slider',
        },
        menuOptions: {
            quick: {
                label: {
                    en: 'Edit slider',
                    fr: 'Edit slider',
                },
                sections: ['slideIndex'],
            },
        },
    },
    properties: {
        slideIndex: {
            label: { en: 'Slides', fr: 'Slides' },
            type: 'Tabs',
            editorOnly: true,
            options: content => ({
                labels: content.mainLayoutContent.map(({ uid }) => ({
                    type: 'element',
                    uid,
                })),
                prefixLabel: 'Slide',
                nbTabs: content.mainLayoutContent.length,
                add: 'addSlide',
                remove: 'removeSlide',
            }),
            section: 'settings',
            defaultValue: 0,
        },
        slidesPerView: {
            type: 'Number',
            label: {
                en: 'Slides per view',
                fr: 'Slides per view',
            },
            options: content => ({
                min: 1,
                max: content.mainLayoutContent.length,
                step: 1,
            }),
            responsive: true,
            defaultValue: 1,
            section: 'settings',
        },
        spaceBetween: {
            type: 'Length',
            label: {
                en: 'Space between',
                fr: 'Space between',
            },
            options: {
                unitChoices: [{ value: 'px', label: 'px' }],
            },
            responsive: true,
            defaultValue: '0px',
            section: 'settings',
        },
        effect: {
            label: {
                en: 'Effect',
                fr: 'Effect',
            },
            type: 'TextSelect',
            options: {
                options: [
                    { value: 'slide', label: { en: 'slide' } },
                    { value: 'fade', label: { en: 'fade' } },
                ],
            },
            defaultValue: 'slide',
            section: 'settings',
        },
        transitionDuration: {
            type: 'Length',
            label: {
                en: 'Transition duration',
                fr: 'Transition duration',
            },
            options: {
                unitChoices: [{ value: 'ms', label: 'ms', min: 1, max: 5000 }],
            },
            section: 'settings',
            defaultValue: '400ms',
        },
        navigation: {
            type: 'OnOff',
            label: {
                en: 'Navigation',
                fr: 'Navigation',
            },
            defaultValue: true,
            section: 'settings',
        },
        pagination: {
            type: 'OnOff',
            label: {
                en: 'Pagination',
                fr: 'Pagination',
            },
            defaultValue: true,
            section: 'settings',
        },
        loop: {
            type: 'OnOff',
            label: {
                en: 'Loop',
                fr: 'Loop',
            },
            defaultValue: false,
            section: 'settings',
        },
        automatic: {
            type: 'OnOff',
            label: {
                en: 'Automatic',
                fr: 'Automatic',
            },
            defaultValue: false,
            section: 'settings',
        },
        automaticTiming: {
            hidden: content => !content.automatic,
            type: 'Length',
            label: {
                en: 'Timing',
                fr: 'Timing',
            },
            options: {
                unitChoices: [{ value: 's', label: 's', min: 0, max: 20 }],
            },
            defaultValue: '3s',
            section: 'settings',
        },
        linearTransition: {
            hidden: content => !content.automatic,
            type: 'OnOff',
            label: {
                en: 'Linear transition',
                fr: 'Linear transition',
            },
            defaultValue: false,
            section: 'settings',
        },
        slidesContainer: {
            hidden: true,
            defaultValue: [],
        },
        mainLayoutContent: {
            hidden: true,
            defaultValue: [
                wwLib.element({ type: 'ww-flexbox', content: { direction: 'column' } }),
                wwLib.element({ type: 'ww-flexbox', content: { direction: 'column' } }),
                wwLib.element({ type: 'ww-flexbox', content: { direction: 'column' } }),
            ],
        },
        bulletsLayout: {
            hidden: true,
            defaultValue: [],
        },
        bulletsLayoutStates: {
            hidden: true,
            defaultValue: [],
        },
        navigationIcons: {
            hidden: true,
            defaultValue: [wwLib.element('ww-icon'), wwLib.element('ww-icon')],
        },
        bulletsIcons: {
            hidden: true,
            defaultValue: wwLib.element('ww-icon'),
        },
    },
};
