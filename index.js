let speedModifier;

async function recursiveObserver(index, observeArray, _speedModifier = 0.3) {
    if (_speedModifier != 0.3) speedModifier = _speedModifier
    
    if (index >= observeArray.length) {
        console.log("finished");
        return;
    }

    const [parentSelector, childSelector, inputValue] = observeArray[index];
    const parentElement = document.querySelector(parentSelector);
    await scrollToElement(parentElement);

    if (parentElement.querySelector(childSelector)) {
        await runAction();
    } else {
        const observer = new MutationObserver(async () => {
            if (parentElement.querySelector(childSelector)) {
                await runAction();
                observer.disconnect();
            }
        });
        observer.observe(parentElement, { childList: true, subtree: true });
    }

    async function runAction() {
        await new Promise((resolve) => setTimeout(resolve, 500 * speedModifier));
        const childElement = parentElement.querySelector(childSelector);
        childElement.click();

        // If the element is INPUT or TEXTAREA, simulate typing
        if (
            inputValue &&
            (childElement.nodeName === "INPUT" ||
                childElement.nodeName === "TEXTAREA")
        ) {
            await simulateTyping(childElement, inputValue);
            childElement.dispatchEvent(new Event("change")); // Trigger change event after typing
            childElement.blur(); // Trigger blur event after change
            clickOutside(childElement);
        }

        await new Promise((resolve) => setTimeout(resolve, 500 * speedModifier));
        recursiveObserver(index + 1, observeArray);
    }
}

async function simulateTyping(element, text) {
    element.focus();
    element.value = ""; // clear the input field
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const keyCode = char.charCodeAt(0);
        element.value += char;
        element.dispatchEvent(new Event("input", { bubbles: true }));
        await new Promise((resolve) => setTimeout(resolve, 100 * speedModifier));
    }
    element.dispatchEvent(new Event("change", { bubbles: true }));
}

function clickOutside(element) {
    const rect = element.getBoundingClientRect();
    const clickEvent = new MouseEvent("click", {
        clientX: rect.left - 10,
        clientY: rect.top - 10,
        bubbles: true,
        cancelable: true,
    });
    document.body.dispatchEvent(clickEvent);
}

function scrollToElement(element) {
    const topOffset = element.getBoundingClientRect().top - 20;
    window.scrollTo({ top: topOffset, behavior: "smooth" });
    // Wait for scrolling to finish
    return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
            const atBottom =
                window.innerHeight + window.pageYOffset >=
                document.body.offsetHeight - 2;
            if (document.documentElement.scrollTop === topOffset || atBottom) {
                clearInterval(checkInterval);
                resolve();
            }
        }, 100);
    });
}
