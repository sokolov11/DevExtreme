"use strict";

var $ = require("jquery"),
    config = require("core/config"),
    keyboardMock = require("../../../helpers/keyboardMock.js"),
    numberLocalization = require("localization/number"),
    browser = require("core/utils/browser");

require("ui/text_box/ui.text_editor");

var INPUT_CLASS = "dx-texteditor-input",
    PLACEHOLDER_CLASS = "dx-placeholder",
    MINUS_KEY = 189,
    NUMPAD_MINUS_KEYCODE = 109;

var moduleConfig = {
    beforeEach: function() {
        this.$element = $("#numberbox").dxNumberBox({
            format: "#0.##",
            value: "",
            useMaskBehavior: true
        });
        this.input = this.$element.find(".dx-texteditor-input");
        this.instance = this.$element.dxNumberBox("instance");
        this.keyboard = keyboardMock(this.input, true);
    }
};


QUnit.module("format: api value changing", moduleConfig);

QUnit.test("number type of input is not supported with masks", function(assert) {
    var $element = $("#numberbox").dxNumberBox({
            useMaskBehavior: true,
            format: "#",
            mode: "number"
        }),
        instance = $element.dxNumberBox("instance");

    assert.equal($element.find("." + INPUT_CLASS).prop("type"), "tel", "input has tel type");

    instance.option("mode", "number");
    assert.equal($element.find("." + INPUT_CLASS).prop("type"), "tel", "user can not set number type with mask");
});

QUnit.test("empty value should not be formatted", function(assert) {
    this.instance.option("value", "");
    assert.equal(this.input.val(), "", "value is empty");
});

QUnit.test("format should be applied on value change", function(assert) {
    this.instance.option("value", 12.34);
    assert.equal(this.input.val(), "12.34", "value is correct");
});

QUnit.test("value should be reformatted when format option changed", function(assert) {
    this.instance.option("value", 123);
    assert.equal(this.input.val(), "123", "value is correct");

    this.instance.option("format", "#.00");
    assert.equal(this.input.val(), "123.00", "value was reformatted");
});

QUnit.test("setting value to undefined should work correctly", function(assert) {
    this.instance.option({
        format: "#0",
        value: 667
    });

    this.instance.option("value", "");
    this.instance.option("value", undefined);

    assert.strictEqual(this.input.val(), "", "value is correct");
    assert.strictEqual(this.instance.option("value"), undefined, "value is correct");
});

QUnit.test("widget should not crash when it is disposing on change (T578115)", function(assert) {
    this.instance.option({
        value: 1,
        onValueChanged: function(e) {
            e.component.dispose();
        }
    });

    this.keyboard.type("2").change();

    assert.ok(true, "there was no exceptions");
});

QUnit.test("api value changing should hide a placeholder", function(assert) {
    this.instance.option({
        format: "$ #0",
        placeholder: "Enter number"
    });

    var $placeholder = this.$element.find("." + PLACEHOLDER_CLASS);

    assert.ok($placeholder.is(":visible"), "placeholder is visible");

    this.instance.option("value", 1);

    assert.equal(this.input.val(), "$ 1", "text is correct");
    assert.notOk($placeholder.is(":visible"), "placeholder is hidden");
});


QUnit.module("format: sign and minus button", moduleConfig);

QUnit.test("pressing '-' button should revert the number", function(assert) {
    this.instance.option({
        format: "#.000",
        value: 123.456
    });

    this.keyboard.caret(3).keyDown(NUMPAD_MINUS_KEYCODE).input("-");
    assert.equal(this.input.val(), "-123.456", "value is correct");
    assert.equal(this.instance.option("value"), 123.456, "value should not be changed before valueChange event");
    assert.deepEqual(this.keyboard.caret(), { start: 4, end: 4 }, "caret is correct");
    this.keyboard.change();
    assert.equal(this.instance.option("value"), -123.456, "value has been changed after valueChange event");

    this.keyboard.keyDown(NUMPAD_MINUS_KEYCODE).input("-");
    assert.equal(this.input.val(), "123.456", "value is correct");
    assert.equal(this.instance.option("value"), -123.456, "value should not be changed before valueChange event");
    assert.deepEqual(this.keyboard.caret(), { start: 3, end: 3 }, "caret is correct");
    this.keyboard.change();
    assert.equal(this.instance.option("value"), 123.456, "value has been changed after valueChange event");

    this.keyboard.caret(3).keyDown(MINUS_KEY).input("-");
    assert.equal(this.input.val(), "-123.456", "value is correct");
    assert.equal(this.instance.option("value"), 123.456, "value should not be changed before valueChange event");
    assert.deepEqual(this.keyboard.caret(), { start: 4, end: 4 }, "caret is correct");
    this.keyboard.change();
    assert.equal(this.instance.option("value"), -123.456, "value has been changed after valueChange event");

    this.keyboard.keyDown(MINUS_KEY).input("-");
    assert.equal(this.input.val(), "123.456", "value is correct");
    assert.equal(this.instance.option("value"), -123.456, "value should not be changed before valueChange event");
    assert.deepEqual(this.keyboard.caret(), { start: 3, end: 3 }, "caret is correct");
    this.keyboard.change();
    assert.equal(this.instance.option("value"), 123.456, "value has been changed after valueChange event");
});

QUnit.test("pressing numpad minus button should revert the number", function(assert) {
    this.instance.option({
        format: "#.000",
        value: 123.456
    });

    this.keyboard
        .caret(3)
        .keyDown(NUMPAD_MINUS_KEYCODE)
        .keyPress(NUMPAD_MINUS_KEYCODE)
        .keyUp(NUMPAD_MINUS_KEYCODE);

    if(!browser.msie) {
        this.keyboard.input();
    }

    assert.equal(this.input.val(), "-123.456", "value is correct");
    assert.equal(this.instance.option("value"), 123.456, "value should not be changed before valueChange event");
    assert.deepEqual(this.keyboard.caret(), { start: 4, end: 4 }, "caret is correct");
    this.keyboard.change();
    assert.equal(this.instance.option("value"), -123.456, "value has been changed after valueChange event");
});

QUnit.test("pressing '-' button should revert zero number", function(assert) {
    this.instance.option({
        format: "#0",
        value: 0
    });

    this.keyboard.keyDown(MINUS_KEY).input("-").change();
    assert.equal(this.input.val(), "-0", "text is correct");
    assert.equal(1 / this.instance.option("value"), -Infinity, "value is negative");

    this.keyboard.keyDown(MINUS_KEY).input("-").change();
    assert.equal(this.input.val(), "0", "text is correct");
    assert.equal(1 / this.instance.option("value"), Infinity, "value is positive");
});

QUnit.test("pressing '-' with different positive and negative parts", function(assert) {
    this.instance.option({
        format: "$ #0;($ #0)",
        value: 123
    });

    this.keyboard.keyDown(MINUS_KEY).input("-").change();
    assert.equal(this.input.val(), "($ 123)", "text is correct");
    assert.equal(this.instance.option("value"), -123, "value is negative");

    this.keyboard.keyDown(MINUS_KEY).input("-").change();
    assert.equal(this.input.val(), "$ 123", "text is correct");
    assert.equal(this.instance.option("value"), 123, "value is positive");
});

QUnit.test("focusout after inverting sign should not lead to value changing", function(assert) {
    this.instance.option("value", -123);

    // note: keyboard mock keyDown send wrong key for '-' and can not be used here
    this.input.trigger($.Event("keydown", { keyCode: MINUS_KEY, which: MINUS_KEY, key: "-" }));
    this.keyboard.caret(3).input("-");
    this.keyboard.blur().change();

    assert.equal(this.input.val(), "123", "text is correct");
    assert.equal(this.instance.option("value"), 123, "value is correct");
});

QUnit.test("pressing minus button should revert selected number", function(assert) {
    this.instance.option({
        format: "$ #0.00",
        value: 0
    });

    this.keyboard.caret({ start: 0, end: 5 }).keyDown(MINUS_KEY).type("-");
    assert.equal(this.input.val(), "-$ 0.00", "text is correct");
    assert.deepEqual(this.keyboard.caret(), { start: 3, end: 3 }, "caret is good");
});


QUnit.module("format: fixed point format", moduleConfig);

QUnit.test("value should be formatted on first input", function(assert) {
    this.instance.option("format", "#0.00");

    this.keyboard.type("1");
    assert.equal(this.input.val(), "1.00", "required digits was added on first input");
});

QUnit.test("extra decimal points should be ignored", function(assert) {
    this.instance.option("format", "#0.00");

    this.keyboard.type("2..05");
    assert.equal(this.input.val(), "2.05", "text is correct");

    this.keyboard.caret(3).type(".");
    assert.equal(this.input.val(), "2.05", "extra point should be prevented");
});

QUnit.test("value should be rounded to the low digit on input an extra float digits", function(assert) {
    this.instance.option("format", "#0.00");

    this.keyboard.type("2.057").change();
    assert.equal(this.input.val(), "2.05", "text is correct");
    assert.equal(this.instance.option("value"), 2.05, "value is correct");
});

QUnit.test("required digits should be replaced on input", function(assert) {
    this.instance.option({
        format: "#0.00",
        value: 1.23
    });

    this.keyboard.caret(2).type("45");
    assert.equal(this.input.val(), "1.45", "text is correct");
});

QUnit.test("removing required value should replace it to 0", function(assert) {
    this.instance.option({
        format: "#0.000",
        value: 1.234
    });

    this.keyboard.caret(3).press("backspace");
    assert.equal(this.input.val(), "1.340", "backspace works");

    this.keyboard.press("del");
    assert.equal(this.input.val(), "1.400", "delete works");
});

QUnit.test("removing decimal point should move the caret", function(assert) {
    this.instance.option({
        format: "#0.00",
        value: 1.23
    });

    this.keyboard.caret(2).press("backspace");
    assert.deepEqual(this.keyboard.caret().start, 1, "caret was moved");
});

QUnit.test("removing last integer should replace it to 0", function(assert) {
    this.instance.option({
        format: "#0.00",
        value: 1.23
    });

    this.keyboard.caret(1).press("backspace");
    assert.equal(this.input.val(), "0.23", "integer was replaced to 0");
});

QUnit.test("input with non-required digit", function(assert) {
    this.instance.option("format", "#0.##");

    this.keyboard.type("1");
    assert.equal(this.input.val(), "1", "extra digits should not be shown");

    this.keyboard.type("..");
    assert.equal(this.input.val(), "1", "extra point should reformat the value");

    this.keyboard.type(".0");
    assert.equal(this.input.val(), "1.0", "zero should not be rounded");

    this.keyboard.type("56");
    assert.equal(this.input.val(), "1.05", "extra digit should be rounded");
});

QUnit.test("extra zeros in the end should be prevented from input", function(assert) {
    this.instance.option({
        format: "#.##",
        value: 1.52
    });

    this.keyboard.caret(4).type("0");

    assert.equal(this.input.val(), "1.52", "extra zero input has been prevented");
});

QUnit.test("removed digits should not be replaced to 0 when they are not required", function(assert) {
    this.instance.option({
        format: "#0.##",
        value: 1.23
    });

    this.keyboard.caret(3).press("backspace");
    assert.equal(this.input.val(), "1.3", "digit was removed");

    this.keyboard.press("del").change();
    assert.equal(this.input.val(), "1", "decimal point was removed together with last float digit");
});


QUnit.module("format: minimum and maximum", moduleConfig);

QUnit.test("invert sign should be prevented if minimum is larger than 0", function(assert) {
    this.instance.option({
        min: 0,
        value: 4
    });

    this.keyboard.keyDown(MINUS_KEY);
    assert.equal(this.input.val(), "4", "reverting was prevented");
});

QUnit.test("integer should not be longer than 15 digit", function(assert) {
    this.instance.option("value", 999999999999999);
    this.keyboard.caret(15).type("5");

    assert.equal(this.input.val(), "999999999999999", "input was prevented");
});

QUnit.test("negative integer should not be longer than 15 digit", function(assert) {
    this.instance.option("value", -999999999999999);
    this.keyboard.caret(16).type("5");

    assert.equal(this.input.val(), "-999999999999999", "input was prevented");
});

QUnit.test("15-digit value with decimal part should be parsed", function(assert) {
    this.instance.option("format", "#0.####");
    this.instance.option("value", 9999999999.999);
    this.keyboard.caret(14).type("9");

    assert.equal(this.input.val(), "9999999999.9999", "input was not prevented");
});

QUnit.test("boundary value should correctly apply after second try to set overflow value", function(assert) {
    this.instance.option({
        min: 1,
        max: 4,
        value: 2
    });

    this.input.val("");
    this.keyboard
        .type("6")
        .press("enter")
        .change();

    assert.equal(this.input.val(), "4", "text is adjusted to max");
    assert.equal(this.instance.option("value"), 4, "value is adjusted to max");

    this.input.val("");
    this.keyboard
        .type("7")
        .press("enter")
        .change();

    assert.equal(this.input.val(), "4", "text is adjusted to max second time");
    assert.equal(this.instance.option("value"), 4, "value is adjusted to max second time");

    this.input.val("");
    this.keyboard
        .type("0")
        .press("enter")
        .change();

    assert.equal(this.input.val(), "1", "text is adjusted to min");
    assert.equal(this.instance.option("value"), 1, "value is adjusted to min");
});


QUnit.module("format: text input", moduleConfig);

QUnit.test("mask should work with arabic digit shaping", function(assert) {
    var arabicDigits = "٠١٢٣٤٥٦٧٨٩";
    var arabicSeparator = "٫";

    var standardToArabicMock = function(text) {
        return text.split("").map(function(sign) {
            if(sign === ".") {
                return arabicSeparator;
            }
            return arabicDigits[sign] || sign;
        }).join("");
    };

    var arabicToStandardMock = function(text) {
        return text.split("").map(function(sign) {
            if(sign === arabicSeparator) {
                return ".";
            }
            var standardSign = arabicDigits.indexOf(sign);
            return standardSign < 0 ? sign : standardSign;
        }).join("");
    };

    numberLocalization.inject({
        format: function(number) {
            return number && standardToArabicMock(String(number));
        },
        parse: function(text) {
            return text && parseFloat(arabicToStandardMock(text));
        }
    });

    try {
        this.keyboard
            .type("١٢٣٤٥")
            .press("backspace")
            .change();

        assert.equal(this.input.val(), "١٢٣٤");
        assert.equal(this.instance.option("value"), 1234);
    } finally {
        numberLocalization.resetInjection();
    }
});

QUnit.test("invalid chars should be prevented on keydown", function(assert) {
    this.keyboard.type("12e*3.456");
    assert.equal(this.input.val(), "123.45", "value is correct");
});

QUnit.test("input should be correct with group separators", function(assert) {
    this.instance.option("format", "$ #,##0.00 d");

    this.keyboard.type("1234567.894");
    assert.equal(this.input.val(), "$ 1,234,567.89 d", "input is correct");
});

QUnit.test("select and replace all text", function(assert) {
    this.instance.option({
        format: "$ #.000 d",
        value: 123
    });

    this.keyboard
        .caret({ start: 0, end: 11 })
        .type("4");

    assert.equal(this.input.val(), "$ 4.000 d", "value is correct");
    assert.deepEqual(this.keyboard.caret(), { start: 3, end: 3 }, "caret position is correct");
});

QUnit.test("decimal point should move the caret before float part only", function(assert) {
    this.instance.option({
        format: "#0.00",
        value: 123.45
    });
    this.keyboard.caret(2).type(".");

    assert.equal(this.input.val(), "123.45", "value is right");
    assert.deepEqual(this.keyboard.caret(), { start: 2, end: 2 }, "caret was not moved");

    this.keyboard.caret(3).type(".");
    assert.equal(this.input.val(), "123.45", "value is right");
    assert.deepEqual(this.keyboard.caret(), { start: 4, end: 4 }, "caret was moved to the float part");
});

QUnit.test("input after 0 should not move caret to float part", function(assert) {
    this.instance.option({
        format: "#0.00",
        value: 0
    });

    this.keyboard.caret(1).type("1");

    assert.equal(this.keyboard.caret().start, 1, "caret is good");
});

QUnit.test("ctrl+v should not be prevented", function(assert) {
    this.keyboard.keyDown("v", { ctrlKey: true });
    assert.strictEqual(this.keyboard.event.isDefaultPrevented(), false, "keydown event is not prevented");
});

QUnit.test("decimal point input should be prevented when it is restricted by the format", function(assert) {
    this.instance.option({
        format: "#0",
        value: 123
    });

    this.keyboard.caret(1).type(".");

    assert.equal(this.input.val(), "123", "value is correct");
    assert.equal(this.keyboard.caret().start, 1, "caret should not be moved");
});

QUnit.test("leading zeros should be replaced on input", function(assert) {
    this.instance.option("format", "$ #0 d");
    this.instance.option("value", 0);

    assert.equal(this.input.val(), "$ 0 d", "value is correct");

    this.keyboard.caret(3).type("12");

    assert.equal(this.input.val(), "$ 12 d", "value is correct");
});

QUnit.test("leading zeros should not be replaced if input is before them", function(assert) {
    this.instance.option("format", "#0 d");
    this.instance.option("value", 0);

    assert.equal(this.input.val(), "0 d", "value is correct");

    this.keyboard.caret(0).type("12");

    assert.equal(this.input.val(), "120 d", "value is correct");
});

QUnit.test("it should be possible to input decimal point when valueChangeEvent is input (T580162)", function(assert) {
    this.instance.option("valueChangeEvent", "input");
    this.keyboard.type("1.5");

    assert.equal(this.input.val(), "1.5", "value is correct");
});

QUnit.test("valueChanged event fires on value apply", function(assert) {
    if(!browser.msie) {
        // You can remove this test once issue noted below will resolved
        // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/15181565/
        assert.ok(true, "It is IE and Edge specific test");
        return;
    }

    var valueChangedSpy = sinon.spy();

    this.instance.on("valueChanged", valueChangedSpy);
    this.keyboard.caret(0).type("123").press("enter");

    assert.ok(valueChangedSpy.calledOnce, "valueChanged event called once");
});


QUnit.module("format: incomplete value", moduleConfig);

QUnit.test("incomplete values should not be reformatted on input", function(assert) {
    this.instance.option({
        format: "#0.####",
        value: null
    });

    this.keyboard.type("0.0005");
    assert.equal(this.input.val(), "0.0005", "value was typed");
});

QUnit.test("incomplete values with stubs should not be reformatted on input", function(assert) {
    this.instance.option({
        format: "$ #0.#### kg",
        value: null
    });

    this.keyboard.type("0.0005");
    assert.equal(this.input.val(), "$ 0.0005 kg", "value was typed");
});

QUnit.test("incomplete values should not be reformatted on paste", function(assert) {
    this.instance.option({
        format: "$ #0.#### kg",
        value: null
    });

    this.input.val("0.00");
    this.keyboard.caret(4).input();
    assert.equal(this.input.val(), "0.00", "walue has not been reformatted");

    this.keyboard.type("0");
    assert.equal(this.input.val(), "0.000", "walue has not been reformatted yet");

    this.keyboard.type("5");
    assert.equal(this.input.val(), "$ 0.0005 kg", "walue has been reformatted");
});

QUnit.test("incomplete values should be limited by max precision", function(assert) {
    this.instance.option({
        format: "$ #0.### kg",
        value: null
    });

    this.keyboard.type("0.000");
    assert.equal(this.input.val(), "$ 0.000 kg", "value is incomplete");

    this.keyboard.press("enter");
    assert.equal(this.input.val(), "$ 0 kg", "value was reformatted on enter");
});

QUnit.test("value can be incomplete after removing via backspace", function(assert) {
    this.instance.option({
        format: "$ #0.### kg",
        value: 1.2
    });

    this.keyboard.caret(5).press("backspace");
    assert.equal(this.input.val(), "$ 1. kg", "value has not been reformatted");
});

QUnit.test("value can be incomplete after removing via delete", function(assert) {
    this.instance.option({
        format: "$ #0.### kg",
        value: 1.2
    });

    this.keyboard.caret(4).press("del");
    assert.equal(this.input.val(), "$ 1. kg", "value has not been reformatted");
});

QUnit.test("value without float part should never be incomplete", function(assert) {
    this.instance.option({
        format: "$ #0.####",
        value: null
    });

    this.input.val("10");
    this.keyboard.input();
    assert.equal(this.input.val(), "$ 10", "value has been reformatted");
});

QUnit.test("zero should not be incomplete", function(assert) {
    this.instance.option({
        format: "#0.00",
        value: 12.34
    });

    this.keyboard.caret({ start: 0, end: 5 }).type("0");

    assert.equal(this.input.val(), "0.00", "zero has been formatted");
});

QUnit.test("value without integer part is not supported", function(assert) {
    this.instance.option({
        format: "$ #.#",
        value: null
    });

    this.keyboard.type(".5");
    assert.equal(this.input.val(), "$ 5", "point should be prevented");
});

QUnit.test("value with more than one point should not be incomplete", function(assert) {
    this.instance.option({
        format: "$ #0.###",
        value: null
    });

    this.keyboard.type("1.0.");
    assert.equal(this.input.val(), "$ 1", "value was reformatted");
});

QUnit.test("entering any stub in incomplete value should reformat the value", function(assert) {
    this.instance.option({
        format: "$ #0.###",
        value: null
    });

    this.keyboard.type("$ 1.0r");
    assert.equal(this.input.val(), "$ 1.0", "stub was prevented");
});

QUnit.test("incomplete value should be limited by min precision", function(assert) {
    this.instance.option({
        format: "#0.0##",
        value: 1
    });

    this.keyboard.caret(3).press("backspace");
    assert.equal(this.input.val(), "1.0", "zero has not been removed");
});

QUnit.test("incomplete values should be reformatted on enter", function(assert) {
    this.keyboard.type("123.").press("enter");
    assert.equal(this.input.val(), "123", "input was reformatted");
});

QUnit.testInActiveWindow("incomplete values should be reformatted on focusout", function(assert) {
    this.instance.option("value", 123);
    this.keyboard.caret(3).type(".").blur();
    assert.equal(this.input.val(), "123", "input was reformatted");
});

QUnit.test("minus sign typed to the end of the incomplete value should revert sign", function(assert) {
    this.instance.option({
        format: "#0.##",
        value: 0
    });

    this.keyboard
        .caret(1)
        .type(".0")
        .keyDown(MINUS_KEY)
        .type("-");

    assert.equal(this.input.val(), "-0", "value has been reformatted after incorrect sign");
});


QUnit.module("format: percent format", moduleConfig);

QUnit.test("percent format should work properly on value change", function(assert) {
    this.instance.option("format", "#0%");
    this.keyboard.type("45").change();

    assert.equal(this.input.val(), "45%", "text is correct");
    assert.equal(this.instance.option("value"), 0.45, "value is correct");
});

QUnit.test("escaped percent should be parsed correctly", function(assert) {
    this.instance.option("format", "#0'%'");
    this.keyboard.type("123").change();

    assert.equal(this.input.val(), "123%", "text is correct");
    assert.equal(this.instance.option("value"), 123, "value is correct");
});

QUnit.test("non-ldml percent format should work properly on value change", function(assert) {
    this.instance.option("value", "");
    this.instance.option("format", "percent");
    this.keyboard.type("45").change();

    assert.equal(this.input.val(), "45%", "text is correct");
    assert.equal(this.instance.option("value"), 0.45, "value is correct");
});

QUnit.test("input before leading zero in percent format", function(assert) {
    this.instance.option("format", "#0%");
    this.instance.option("value", 0);

    this.keyboard.caret(0).type("45");

    assert.equal(this.input.val(), "450%", "text is correct");
});


QUnit.module("format: removing", moduleConfig);

QUnit.test("delete key", function(assert) {
    this.instance.option({
        format: "$ #0.00 d",
        value: 123.45
    });

    this.keyboard.caret(0).keyDown("del");
    assert.ok(this.keyboard.event.isDefaultPrevented(), "delete should not remove a stub");

    this.keyboard.caret(2).keyDown("del");
    assert.notOk(this.keyboard.event.isDefaultPrevented(), "delete should not be prevented");
    this.keyboard.input("del");
    assert.equal(this.input.val(), "$ 23.45 d", "value is correct");

    this.keyboard.caret(4).keyDown("del");
    assert.deepEqual(this.keyboard.caret(), { start: 5, end: 5 }, "caret should be moved throug the point");
    assert.ok(this.keyboard.event.isDefaultPrevented(), "delete should not remove a point");

    this.keyboard.caret(5).keyDown("del");
    assert.notOk(this.keyboard.event.isDefaultPrevented(), "delete should not be prevented");
    this.keyboard.input("del");
    assert.equal(this.input.val(), "$ 23.50 d", "required digit should be replaced to 0 after removing");
});

QUnit.test("backspace key", function(assert) {
    this.instance.option({
        format: "$ #0.00 d",
        value: 123.45
    });

    this.keyboard.caret(1).keyDown("backspace");
    assert.ok(this.keyboard.event.isDefaultPrevented(), "delete should not remove a stub");

    this.keyboard.caret(3).keyDown("backspace");
    assert.notOk(this.keyboard.event.isDefaultPrevented(), "delete should not be prevented");
    this.keyboard.input("backspace");
    assert.equal(this.input.val(), "$ 23.45 d", "value is correct");

    this.keyboard.caret(5).keyDown("backspace");
    assert.deepEqual(this.keyboard.caret(), { start: 4, end: 4 }, "caret should be moved throug the point");
    assert.ok(this.keyboard.event.isDefaultPrevented(), "delete should not remove a point");

    this.keyboard.caret(6).keyDown("backspace");
    assert.notOk(this.keyboard.event.isDefaultPrevented(), "delete should not be prevented");
    this.keyboard.input("backspace");
    assert.equal(this.input.val(), "$ 23.50 d", "required digit should be replaced to 0 after removing");
});

QUnit.test("removing non required char with negative value", function(assert) {
    this.instance.option("value", -123.45);

    this.keyboard.caret(6).press("del");
    assert.equal(this.input.val(), "-123.4", "value is correct");

    this.keyboard.press("backspace").change();
    assert.equal(this.input.val(), "-123", "value is correct");
});

QUnit.test("last non required zero should not be typed", function(assert) {
    this.instance.option("format", "#.##");
    this.keyboard.type("1.50");

    assert.equal(this.input.val(), "1.50", "zero type was not prevented");

    this.input.blur();
    assert.equal(this.input.val(), "1.5", "value was reformatted on focusout");
});

QUnit.test("removing with group separators using delete key", function(assert) {
    this.instance.option({
        format: "$ #,##0.## d",
        value: 1234567890
    });

    assert.equal(this.input.val(), "$ 1,234,567,890 d", "value is correct");

    this.keyboard.caret(2).press("del");
    assert.equal(this.input.val(), "$ 234,567,890 d", "value is correct");
    assert.deepEqual(this.keyboard.caret(), { start: 2, end: 2 }, "caret is good");

    this.keyboard.caret(5).press("del");
    assert.equal(this.input.val(), "$ 234,567,890 d", "value is correct");
    assert.deepEqual(this.keyboard.caret(), { start: 6, end: 6 }, "caret is good");

    this.keyboard.caret({ start: 4, end: 11 }).press("del");
    assert.equal(this.input.val(), "$ 2,390 d", "value is correct");
    assert.deepEqual(this.keyboard.caret(), { start: 5, end: 5 }, "caret is good after selection removing");
});

QUnit.test("removing with group separators using backspace key", function(assert) {
    this.instance.option({
        format: "$ #,##0.## d",
        value: 1234567890
    });

    assert.equal(this.input.val(), "$ 1,234,567,890 d", "value is correct");

    this.keyboard.caret(3).press("backspace");

    assert.equal(this.input.val(), "$ 234,567,890 d", "value is correct");
    assert.deepEqual(this.keyboard.caret(), { start: 2, end: 2 }, "caret is good");

    this.keyboard.caret(6).press("backspace");
    assert.equal(this.input.val(), "$ 234,567,890 d", "value is correct");
    assert.deepEqual(this.keyboard.caret(), { start: 5, end: 5 }, "caret is good");

    this.keyboard.caret({ start: 4, end: 11 }).press("backspace");
    assert.equal(this.input.val(), "$ 2,390 d", "value is correct");
});

QUnit.test("removing required last char should replace it to 0", function(assert) {
    this.instance.option({
        format: "#0.00",
        value: 1
    });
    this.keyboard.caret(1).press("backspace");

    assert.equal(this.input.val(), "0.00", "value is correct");
    assert.deepEqual(this.keyboard.caret(), { start: 1, end: 1 }, "caret is good");
});

QUnit.test("removing required last char should replace it to 0 if there are stubs before", function(assert) {
    this.instance.option({
        format: "$#0.00",
        value: 1
    });
    this.keyboard.caret(2).press("backspace");

    assert.equal(this.input.val(), "$0.00", "value is correct");
    assert.equal(this.keyboard.caret().start, 2, "caret is good");
});

QUnit.test("removing required last char should replace it to 0 if percent format", function(assert) {
    this.instance.option("format", "#0%");
    this.instance.option("value", 0.01);
    this.keyboard.caret(1).press("backspace");

    assert.equal(this.input.val(), "0%", "value is correct");
    assert.deepEqual(this.keyboard.caret(), { start: 1, end: 1 }, "caret position is correct");
});

QUnit.test("removing required decimal digit should replace it to 0 and move caret", function(assert) {
    this.instance.option({
        format: "#0.00",
        value: 1.23
    });

    this.keyboard.caret(4).press("backspace");

    assert.equal(this.input.val(), "1.20", "value is correct");
    assert.deepEqual(this.keyboard.caret(), { start: 3, end: 3 }, "caret position is correct");

    this.keyboard.press("backspace");
    assert.equal(this.input.val(), "1.00", "value is correct");
    assert.deepEqual(this.keyboard.caret(), { start: 2, end: 2 }, "caret position is correct");
});

QUnit.test("removing integer digit using backspace if group separator is hiding", function(assert) {
    this.instance.option({
        format: "#,##0",
        value: 1234
    });
    this.keyboard.caret(4).press("backspace");

    assert.equal(this.input.val(), "124", "value is correct");
    assert.deepEqual(this.keyboard.caret(), { start: 2, end: 2 }, "caret position is correct");
});

QUnit.test("removing all characters should change value to 0", function(assert) {
    this.instance.option({
        format: "$#0",
        value: 1
    });

    this.keyboard.caret({ start: 0, end: 2 }).press("backspace").change();

    assert.strictEqual(this.input.val(), "$0", "value is correct");
    assert.strictEqual(this.instance.option("value"), 0, "value is reseted");
});

QUnit.test("removing all digits but not all characters should change value to 0", function(assert) {
    this.instance.option({
        format: "#0.0 kg",
        value: 1
    });

    this.keyboard.caret({ start: 0, end: 4 }).press("backspace").change();

    assert.strictEqual(this.input.val(), "0.0 kg", "value is correct");
    assert.strictEqual(this.instance.option("value"), 0, "value is reseted");
});

QUnit.test("removing all digits with backspace should be possible when required zeros are in the end", function(assert) {
    this.instance.option({
        format: "#0.00",
        value: 1
    });

    this.keyboard.caret(5)
        .press("backspace")
        .press("backspace")
        .press("backspace")
        .press("backspace");

    assert.equal(this.input.val(), "0.00", "value is correct");
});

QUnit.test("removing all digits should save the sign", function(assert) {
    this.instance.option({
        format: "#0 kg",
        value: -1
    });

    this.keyboard.caret({ start: 2, end: 2 }).press("backspace").input("backspace");

    assert.strictEqual(this.input.val(), "-0 kg", "text is correct");
});

QUnit.test("removing last digit 0 should save the sign", function(assert) {
    this.instance.option({
        format: "#0 kg",
        value: -0
    });

    this.keyboard.caret({ start: 2, end: 2 }).press("backspace").input("backspace");

    assert.strictEqual(this.input.val(), "-0 kg", "text is correct");
});

QUnit.test("removing digit if decimal format", function(assert) {
    this.instance.option({
        format: "00000",
        value: 1234
    });

    assert.equal(this.input.val(), "01234", "value is correct");

    this.keyboard.caret(5).press("backspace");
    assert.equal(this.input.val(), "00123", "value is correct");
    assert.deepEqual(this.keyboard.caret(), { start: 5, end: 5 }, "caret is correct");
});

QUnit.test("removing digit if decimal format with prefix", function(assert) {
    this.instance.option({
        format: "$00000",
        value: 1234
    });

    assert.equal(this.input.val(), "$01234", "value is correct");

    this.keyboard.caret(6).press("backspace");
    assert.equal(this.input.val(), "$00123", "value is correct");
    assert.deepEqual(this.keyboard.caret(), { start: 6, end: 6 }, "caret is correct");
});

QUnit.test("removing decimal separator should be possible if float part is not required", function(assert) {
    this.instance.option({
        format: "#0.## kg",
        value: "12.3"
    });

    this.keyboard.caret(4)
        .press("backspace")
        .press("backspace");

    assert.equal(this.input.val(), "12 kg", "decimal separator has been removed");
});

QUnit.test("removing decimal separator if decimal separator is not default", function(assert) {
    var oldDecimalSeparator = config().decimalSeparator;

    config({ decimalSeparator: "," });

    try {
        this.instance.option({
            format: "#0.00",
            value: 1
        });

        this.keyboard.caret(2).press("backspace");

        assert.equal(this.input.val(), "1,00", "text is correct");
        assert.deepEqual(this.keyboard.caret(), { start: 1, end: 1 }, "caret is moved");
    } finally {
        config({ decimalSeparator: oldDecimalSeparator });
    }
});

QUnit.test("removing a stub in the end or begin of the text should lead to remove minus sign", function(assert) {
    this.instance.option({
        format: "$ #0.00;<<$ #0.00>>",
        value: -5
    });

    this.keyboard.caret(4).press("backspace");
    assert.equal(this.input.val(), "$ 5.00", "value has been inverted");

    this.keyboard.caret(2).press("backspace");
    assert.equal(this.input.val(), "$ 5.00", "value has not been inverted after second removing");

    this.instance.option("value", -6);
    this.keyboard.caret(9).press("del");
    assert.equal(this.input.val(), "$ 6.00", "value has been inverted");

    this.keyboard.caret(6).press("del");
    assert.equal(this.input.val(), "$ 6.00", "value has not been inverted after second removing");
});

QUnit.test("minus zero should be reverted after removing minus via backspace", function(assert) {
    this.instance.option({
        format: "#0.00 kg",
        value: -0
    });

    this.keyboard.caret(1).press("backspace");
    assert.equal(this.input.val(), "0.00 kg", "value has been reverted");

    this.keyboard.caret(4).press("del");
    assert.equal(this.input.val(), "0.00 kg", "value has not been reverted again");
});

QUnit.test("removing a stub should be prevented when it leads to revert sign", function(assert) {
    this.instance.option({
        format: "#0.00 kg",
        value: -0
    });

    this.keyboard.caret(5).press("del");
    assert.equal(this.input.val(), "0.00 kg", "value has been reverted");
});

QUnit.module("format: caret boundaries", moduleConfig);

QUnit.test("right arrow limitation", function(assert) {
    this.instance.option({
        format: "#d",
        value: 1
    });

    assert.equal(this.input.val(), "1d", "text is correct");

    this.keyboard.caret(1).keyDown("right");
    assert.ok(this.keyboard.event.isDefaultPrevented(), "event is prevented");
});

QUnit.test("right arrow after select all", function(assert) {
    this.instance.option({
        format: "# d",
        value: 1
    });

    assert.equal(this.input.val(), "1 d", "text is correct");

    this.keyboard.caret({ start: 0, end: 3 }).keyDown("right");

    assert.deepEqual(this.keyboard.caret(), { start: 1, end: 1 }, "caret is after last digit");
});

QUnit.test("left arrow limitation", function(assert) {
    this.instance.option({
        format: "$#",
        value: 1
    });

    assert.equal(this.input.val(), "$1", "text is correct");

    this.keyboard.caret(1).keyDown("left");
    assert.ok(this.keyboard.event.isDefaultPrevented(), "event is prevented");
});

QUnit.test("left arrow after select all", function(assert) {
    this.instance.option({
        format: "$ #0",
        value: 1
    });

    assert.equal(this.input.val(), "$ 1", "text is correct");

    this.keyboard.caret({ start: 0, end: 3 }).keyDown("left");

    assert.deepEqual(this.keyboard.caret(), { start: 2, end: 2 }, "caret is before first digit");
});

QUnit.test("home button limitation", function(assert) {
    this.instance.option({
        format: "$#",
        value: 1
    });

    assert.equal(this.input.val(), "$1", "text is correct");

    this.keyboard.caret(2).keyDown("home");
    assert.deepEqual(this.keyboard.caret(), { start: 1, end: 1 }, "caret is on the boundary");
});

QUnit.test("end button limitation", function(assert) {
    this.instance.option({
        format: "#d",
        value: 1
    });

    assert.equal(this.input.val(), "1d", "text is correct");

    this.keyboard.caret(0).keyDown("end");
    assert.deepEqual(this.keyboard.caret(), { start: 1, end: 1 }, "caret is on the boundary");
});

QUnit.test("shift+home and shift+end should have default behavior", function(assert) {
    this.keyboard.keyDown("home", { shiftKey: true });
    assert.strictEqual(this.keyboard.event.isDefaultPrevented(), false);

    this.keyboard.keyDown("end", { shiftKey: true });
    assert.strictEqual(this.keyboard.event.isDefaultPrevented(), false);
});

QUnit.test("ctrl+a should have default behavior", function(assert) {
    this.keyboard.keyDown("a", { ctrlKey: true });
    assert.deepEqual(this.keyboard.event.isDefaultPrevented(), false);
});

QUnit.test("moving caret to closest non stub on click - forward direction", function(assert) {
    this.instance.option({
        format: "$ #",
        value: 1
    });

    this.keyboard.caret(0);
    this.input.trigger("dxclick");

    assert.deepEqual(this.keyboard.caret(), { start: 2, end: 2 }, "caret was adjusted");
});

QUnit.test("moving caret to closest non stub on click - backward direction", function(assert) {
    this.instance.option({
        format: "#d",
        value: 1
    });

    this.keyboard.caret(2);
    this.input.trigger("dxclick");

    assert.deepEqual(this.keyboard.caret(), { start: 1, end: 1 }, "caret was adjusted");
});

QUnit.test("move caret to the end when only stubs remain in the input", function(assert) {
    this.instance.option({
        format: "$ #",
        value: 1
    });

    this.keyboard.caret(3)
        .press("backspace");

    assert.equal(this.input.val(), "$ ", "text is correct");

    this.input.trigger("dxclick");

    assert.deepEqual(this.keyboard.caret(), { start: 2, end: 2 }, "caret was adjusted");
});

QUnit.test("move caret to the start when only stubs remain in the input", function(assert) {
    this.instance.option({
        format: "# p",
        value: 1
    });

    this.keyboard.caret(1)
        .press("backspace");

    assert.equal(this.input.val(), " p", "text is correct");

    this.input.trigger("dxclick");

    assert.deepEqual(this.keyboard.caret(), { start: 0, end: 0 }, "caret was adjusted");
});

QUnit.test("caret should not move out of the boundaries when decimal separator was typed in percent format", function(assert) {
    this.instance.option({
        format: "#0%",
        value: 0.01
    });

    this.keyboard.caret(1).type(".");

    assert.equal(this.keyboard.caret().start, 1, "caret should not move when decimal part is disabled");
});

QUnit.test("caret should not move out of the boundaries when non-available digit was typed", function(assert) {
    this.instance.option({
        format: "#0.00 kg",
        value: 1.23
    });

    this.keyboard.caret(4).type("1");

    assert.equal(this.keyboard.caret().start, 4, "caret should not move");
});
