/**
 * 选择器组件
 * created by caoronghua
 * created on 2021-10-19
 * type: 选择器类型(单选/多选), type: string, values: 'single'/'multiple'
 * options: 所有选项, type: array
 * selectedOption: 已选选项(多选时传null), type: string
 * selectedOptions: 已选选项集合(单选时传null), type: array
 * theme: 主题, type: string, values: 'blue'/'green'
 * this.currentSelected: 最终结果保存变量, 父组件通过'select.currentSelected'即可取到最终结果
 */
 define(['backbone'], function (Backbone) {
    let select = Backbone.View.extend({
        events: {
            'click .common-single-selector .single-selector-input': 'toggle',
            'click .common-single-selector .single-selector-options ul li': 'change',
            'click .common-multiple-selector .multiple-selector-input': 'focus',
            'mouseenter .common-multiple-selector .multiple-selector-input .selected-item img': 'hover',
            'click .common-multiple-selector .multiple-selector-input .selected-item img': 'delete',
            'click .common-multiple-selector .multiple-selector-options ul li': 'select'
        },

        render(type, options, selectedOption, selectedOptions, theme) {
            this.focus = false;
            if (type === 'single') {
                this.renderSinlgeSelector(options, selectedOption, theme);
            } else {
                this.renderMultipleSelector(options, selectedOptions, theme);
            }
        },
        
        renderSinlgeSelector(options, selectedOption, theme) {
            let list = '';
            this.currentSelected = selectedOption;
            options.forEach(item => {
                let isSelected = selectedOption === item;
                list += `
                    <li class="${ isSelected ? 'option-selected' : '' }" value="${ item }">
                        <div title="${ item }">${ item }</div>
                        <img src="assets/images/selector_selected_${ theme === 'blue' ? 'blue' : 'green' }.svg" alt="" value="${ item }" style="display: ${ isSelected ? 'block' : 'none' };">
                    </li>`;
            });
            this.$el.html(`
                <div class="common-single-selector single-selector-${ theme }" value="selectedOption">
                    <div class="single-selector-input">
                        <div>${ selectedOption }</div>
                        <img src="assets/images/selector_expand.svg" alt="">
                    </div>
                    <div class="single-selector-options">
                        <ul>${ list }</ul>
                    </div>
                </div>
            `);
        },

        renderMultipleSelector(options, selectedOptions, theme) {
            let me = this,
                content = '', list = '';
            this.currentSelected = [...selectedOptions];
            selectedOptions.forEach(item => {
                content += `
                    <li class="selected-item" value="${ item }">
                        <div>${ item }</div>
                        <img src="assets/images/selector_delete.svg" alt="删除" value="${ item }">
                    </li>`;
            });
            options.forEach(item => {
                let isSelected = selectedOptions.indexOf(item) !== -1;
                list += `
                    <li class="${ isSelected ? 'option-selected' : '' }" value="${ item }">
                        <div title="${ item }">${ item }</div>
                        <img src="assets/images/selector_selected_${ theme === 'blue' ? 'blue' : 'green' }.svg" alt="" value="${ item }" style="display: ${ isSelected ? 'block' : 'none' };">
                    </li>`;
            });
            content += `<li><input autocomplete="off"></li>`;
            this.$el.html(`
                <div class="common-multiple-selector multiple-selector-${ theme }" value="${ selectedOptions.join(',') }">
                    <div tabindex="-1" class="multiple-selector-input">
                        <ul>${ content }</ul>
                    </div>
                    <div class="multiple-selector-options">
                        <ul>${ list }</ul>
                    </div>
                </div>
            `);
            me.$el.find('.common-multiple-selector .multiple-selector-input').bind('keyup', function(e) {
                let length = me.$el.find('.common-multiple-selector .multiple-selector-input .selected-item').length;
                let value = me.$el.find('.common-multiple-selector .multiple-selector-input ul li').eq(length - 1).attr('value');
                if (e.keyCode == 8 && length > 0) {
                    me.$el.find('.common-multiple-selector .multiple-selector-input ul li').eq(length - 1).fadeOut(300, function() {
                        me.$el.find('.common-multiple-selector .multiple-selector-input ul li').eq(length - 1).remove();
                    });
                    me.$el.find('.common-multiple-selector .multiple-selector-options .option-selected').each(function () {
                        let itemValue = $(this).attr('value');
                        if (itemValue === value) {
                            $(this).removeClass('option-selected');
                            $(this).find('img').hide();
                        }
                    });
                    me.currentSelected.splice(me.currentSelected.indexOf(value), 1);
                }
            });
        },

        toggle(e) {
            if ($(e.currentTarget).find('img').hasClass('img-expand')) {
                $(e.currentTarget).removeClass('selector-active');
                $(e.currentTarget).find('img').removeClass('img-expand');
                $(e.currentTarget).siblings('.single-selector-options').slideUp(300);
            } else {
                $(e.currentTarget).addClass('selector-active');
                $(e.currentTarget).find('img').addClass('img-expand');
                $(e.currentTarget).siblings('.single-selector-options').slideDown(300, function() {
                    $(document).bind('click', function () {
                        $(e.currentTarget).siblings('.single-selector-options').slideUp(300);
                        $(e.currentTarget).find('img').removeClass('img-expand');
                        $(e.currentTarget).removeClass('selector-active');
                        $(document).unbind();
                    })
                });
            }
        },

        change(e) {
            let value = $(e.currentTarget).attr('value');
            this.currentSelected = value;
            this.$el.find('.common-single-selector').attr('value', value);
            this.$el.find('.common-single-selector .single-selector-input div').text(value);
            this.$el.find('.common-single-selector .single-selector-options ul li').removeClass('option-selected');
            this.$el.find('.common-single-selector .single-selector-options ul li img').hide();
            $(e.currentTarget).addClass('option-selected');
            $(e.currentTarget).find('img').show();
        },

        focus(e) {
            let me = this;
            e.stopPropagation();
            if (!me.focus) {
                me.focus = !me.focus;
                $(e.currentTarget).find('ul li input').focus();
                $(e.currentTarget).addClass('selector-active');
                $(e.currentTarget).siblings('.multiple-selector-options').slideDown(300, function() {
                    document.addEventListener('click', packUp, false);
                    function packUp(e) {
                        let target = e.target;
                        let className = target.getAttribute("class");
                        while (target != document) {
                            target = target.parentNode;
                        }
                        if (className) {
                            if (className.indexOf('multiple-selector-options') === -1) {
                                me.focus = false;
                                me.$el.find('.common-multiple-selector .multiple-selector-input ul li input').blur();
                                me.$el.find('.common-multiple-selector .multiple-selector-options').slideUp(300);
                                me.$el.find('.common-multiple-selector .multiple-selector-input').removeClass('selector-active');
                                document.removeEventListener('click', arguments.callee);
                            }
                        }
                    }
                });
            } else {
                me.focus = !focus;
                me.$el.find('.common-multiple-selector .multiple-selector-input ul li input').blur();
                me.$el.find('.common-multiple-selector .multiple-selector-options').slideUp(300);
                me.$el.find('.common-multiple-selector .multiple-selector-input').removeClass('selector-active');
            }
        },


        hover(e) {
            $(e.currentTarget).attr('src', 'assets/images/selector_delete_hover.svg');
            $(e.currentTarget).bind('mouseleave', function() {
                $(this).attr('src', 'assets/images/selector_delete.svg');
                $(this).unbind();
            });
        },

        delete(e) {
            let me = this;
            e.stopPropagation();
            let value = $(e.currentTarget).attr('value');
            $(e.currentTarget).parent().fadeOut(300, function() { $(e.currentTarget).parent().remove(); });
            this.currentSelected.splice(this.currentSelected.indexOf(value), 1);
            this.$el.find('.common-multiple-selector').attr('value', this.currentSelected);
            this.$el.find('.common-multiple-selector .multiple-selector-options .option-selected').each(function () {
                let itemValue = $(this).attr('value');
                if (itemValue === value) {
                    $(this).removeClass('option-selected');
                    $(this).find('img').hide();
                }
                me.$el.find('.common-multiple-selector .multiple-selector-input ul li input').focus();
            });
        },

        select(e) {
            e.stopPropagation();
            let value = $(e.currentTarget).attr('value');
            if (this.currentSelected.indexOf(value) === -1) {
                $(e.currentTarget).addClass('option-selected');
                $(e.currentTarget).find('img').show();
                this.currentSelected.push(value);
                this.$el.find('.common-multiple-selector').attr('value', this.currentSelected);
                let length = this.$el.find('.common-multiple-selector .multiple-selector-input .selected-item').length;
                if (length > 0) {
                    this.$el.find('.common-multiple-selector .multiple-selector-input .selected-item').eq(length - 1).after(`
                        <li class="selected-item" value="${ value }" style="display: none;">
                            <div>${ value }</div>
                            <img src="assets/images/selector_delete.svg" alt="删除" value="${ value }">
                        </li>`);
                        this.$el.find('.common-multiple-selector .multiple-selector-input .selected-item').eq(length).fadeIn(300);
                } else {
                    this.$el.find('.common-multiple-selector .multiple-selector-input ul').prepend(`
                        <li class="selected-item" value="${ value }" style="display: none;">
                            <div>${ value }</div>
                            <img src="assets/images/selector_delete.svg" alt="删除" value="${ value }">
                        </li>`);
                        this.$el.find('.common-multiple-selector .multiple-selector-input .selected-item').fadeIn(300);
                }
                this.$el.find('.common-multiple-selector .multiple-selector-input ul li input').focus();
            } else {
                $(e.currentTarget).removeClass('option-selected');
                $(e.currentTarget).find('img').hide();
                this.currentSelected.splice(this.currentSelected.indexOf(value), 1);
                this.$el.find('.common-multiple-selector').attr('value', this.currentSelected);
                this.$el.find('.common-multiple-selector .multiple-selector-input .selected-item').each(function () {
                    let itemValue = $(this).attr('value');
                    if (itemValue === value) {
                        $(this).fadeOut(300, function() { $(this).remove(); });
                    }
                });
                this.$el.find('.common-multiple-selector .multiple-selector-input ul li input').focus();
            }
        },

        destroy() {
            this.stopListening();
            this.undelegateEvents();
            this.$el.removeData().unbind();
            this.remove();
            Backbone.View.prototype.remove.call(this);
        }
    });
    return select;
});
