'use strict';

const THEMES = ['solarized', 'light', 'dark'];

$(function () {
    const $window = $(window);
    const $body = $('body');
    const $header = $($('header.navigation')[1]);
    const $article = $('#article');

    const $stick = $('aside');
    const $toc = $('#toc');
    const $tocExpander = $toc.find('header');
    const $icon = $tocExpander.find('i');

    const $themer = $('.dropdown select');
    const theme = localStorage.getItem('theme') || $themer.val();
    setTheme(theme, $body, $themer);
    $themer.on('change', e => setTheme(e.currentTarget.value.toLowerCase(), $body));

    const $showLineNumbers = $('.checkbox input');
    const showLineNumbers = localStorage.getItem('showLineNumbers') || true;
    setLineNumberVisibility(showLineNumbers, $body, $showLineNumbers);
    $showLineNumbers.on('change', event => setLineNumberVisibility($(event.target).prop('checked'), $body));

    $('a').each(handleExternalLink);

    $('.fa-copy').on('click', copy);

    $tocExpander.on('click', () => {
        $stick.toggleClass('expanded');
        if ($stick.hasClass('expanded')) {
            $icon.removeClass().addClass('fa fa-minus expander');
            const curHeight = $stick.height();
            const autoHeight = $stick.css('height', 'auto').height();
            $stick.height(curHeight).animate({ height: autoHeight + 20 }, 500);
        } else {
            $stick.animate({ height: '80px' }, 500);
            $icon.removeClass().addClass('fa fa-plus expander');
        }
    });

    let lastScrollTop,
        prev = 0;
    const event = () => {
        lastScrollTop = $window.scrollTop();
        const heroHeight = 0;
        const goingDown = lastScrollTop > prev;

        const pastTitle = lastScrollTop > heroHeight + 80;
        $stick.toggleClass('fixed', pastTitle);
        $stick.css({ 'marginTop': pastTitle ? '0px' : '80px' });
        $stick.css({ 'top': '80px' });
        $stick.css({ 'marginTop': '0px' });

        const bottomOfArticle = $article.offset().top + $article.height();
        const bottomOfToc = $stick.offset().top + $stick.height();

        if (bottomOfArticle <= bottomOfToc) {
            $stick.removeClass('fixed');
            $stick.css({ 'top': $article.height() - $stick.height() });
        }
    };

    event();

    $window.scroll(event);
});

const handleExternalLink = function () {
    var a = new RegExp(window.location.host);
    if (!a.test(this.href)) {
        $(this).click(function (event) {
            event.preventDefault();
            event.stopPropagation();
            window.open(this.href, '_blank');
        });
    }
};

const setTheme = (newTheme, $body, $themer) => {
    localStorage.setItem('theme', newTheme);
    $body.removeClass(THEMES.join(' '));
    $body.addClass(newTheme);
    if ($themer) {
        $themer.val(newTheme);
    }
};

const setLineNumberVisibility = (showLineNumbers, $body, $showLineNumbers) => {
    showLineNumbers = JSON.parse(showLineNumbers);
    localStorage.setItem('showLineNumbers', showLineNumbers);
    $body.toggleClass('hide-line-numbers', !showLineNumbers);
    if ($showLineNumbers) {
        $showLineNumbers.prop('checked', showLineNumbers);
    }
};

const copy = event => {
    const $copier = $(event.target);
    const $pre = $copier.parent().find('pre');
    selectText($pre[0]);
    try {
        document.execCommand('copy');
    } catch (err) {}
};

const selectText = element => {
    var doc = document;
    var text = element;
    var range;
    var selection;

    if (doc.body.createTextRange) {
        range = document.body.createTextRange();
        range.moveToElementText(text);
        range.select();
    } else if (window.getSelection) {
        selection = window.getSelection();
        range = document.createRange();
        range.selectNodeContents(text);
        selection.removeAllRanges();
        selection.addRange(range);
    }
};
