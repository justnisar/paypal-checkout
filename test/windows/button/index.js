/* @flow */

import { type ZalgoPromise } from 'zalgo-promise/src';

import { componentTemplate } from '../../../src/components/button/templates';
import { getElement, getElements, errorOnWindowOpen } from '../../tests/common';

let { action, flow = 'popup', authed = false, bridge = false, delay = 0, onRender, checkout, selector, remembered } = window.xprops.test;

let button = componentTemplate({ props: window.xprops });

if (document.body) {
    document.body.innerHTML = button;
}

if (flow === 'iframe') {
    window.paypal.Checkout.contexts.iframe = true;
}

if (bridge) {
    errorOnWindowOpen();
}

function renderCheckout(props = {}) {
    window.paypal.Checkout.renderTo(window.xchild.getParentRenderWindow(), {

        payment: window.xprops.payment,
        onAuthorize(data, actions) : void | ZalgoPromise<void> {

            return window.xprops.onAuthorize({
                ...data,

                payment: {}

            }, {
                ...actions,

                payment: {
                    execute() {
                        // pass
                    },

                    get() : Object {
                        return {};
                    }
                },

                restart() {
                    window.paypal.Checkout.contexts.iframe = true;
                    renderCheckout();
                }

            }).catch(err => {
                return window.xchild.error(err);
            });
        },

        onAuth() {
            // pass
        },

        style: {
            overlayColor: window.xprops.style.overlayColor
        },

        onCancel: window.xprops.onCancel,
        onError:  window.xprops.onError,
        commit:   window.xprops.commit,
        locale:   window.xprops.locale,
        test:     {
            action: action || 'checkout',
            ...checkout
        },

        ...props
    });
}

getElements('.paypal-button', document).forEach(el => {
    el.addEventListener('click', () => {

        if (window.xprops.onClick) {
            window.xprops.onClick();
        }

        renderCheckout({
            fundingSource: el.getAttribute('data-funding-source')
        });
    });
});

if (action === 'auth') {

    if (authed && window.xprops.onAuth) {
        window.xprops.onAuth();
    }

} else if (action === 'remember') {

    window.xprops.funding.remember([ remembered ]);

} else if (action === 'checkout' || action === 'cancel' || action === 'fallback' || action === 'error' || action === 'popout') {

    if (delay) {
        setTimeout(() => {
            getElement(selector || '.paypal-button', document).click();
        }, delay);
    } else {
        getElement(selector || '.paypal-button', document).click();
    }
}

if (onRender) {
    onRender({
        fundingSources: getElements('[data-funding-source]').map(el => el.getAttribute('data-funding-source')),
        click() {
            getElement('.paypal-button', document).click();
        }
    });
}
