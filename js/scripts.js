/* Действия после загрузки страницы */
document.addEventListener('DOMContentLoaded', function () {
    var genreList = document.getElementById('js_genre_list'); // список жанров
    var menuIcon = document.getElementById('mobile_icon'); //
    var menuText = document.getElementById('mobile_burger'); // по клику "меню" -page-404
   

    /* Скрыть лишние жанры после загрузки страницы */
    if (genreList) {
        function hideLoadGenreList() {
            genreList.style.height = 160 + 'px';
            genreList.insertAdjacentHTML('afterEnd', '<div class="b_all_genre" id="js_all_genre"><span>Все жанры</span></div>');
        }

        hideLoadGenreList();

        /* Показать все жанры */
        var allGenre = document.getElementById('js_all_genre');

        function showGenre() {
            allGenre.style.display = 'none';
            genreList.style.height = 'auto';
        }

        allGenre.addEventListener('click', showGenre, false);
    }

    /* показать/скрыть меню */
    if (menuIcon) {
        function topMenuToggle() {
            var tMenu = document.getElementById('mobile_menu');

            if (menuIcon.classList.contains('act')) {
                menuIcon.classList.remove("act");
                tMenu.classList.remove("act");
            } else {
                menuIcon.classList.add("act");
                tMenu.classList.add("act");
            }

        }

        menuIcon.addEventListener('click', topMenuToggle, false);
    }

    /*показать меню по клику "меню" page-404*/
    if (menuText) {
        function topMenuToggle() {
            var tMenu = document.getElementById('mobile_menu');

            if (menuIcon.classList.contains('act')) {} 
            else {
                menuIcon.classList.add("act");
                tMenu.classList.add("act");
            }
        }
        menuText.addEventListener('click', topMenuToggle, false);
    }
  


    /* [173054]  */
    var bookAnnotation = document.getElementById('book_annotation');
    if (bookAnnotation) {
        var truncate = new TruncateText(bookAnnotation, {
            height: 180,
            maxHeight: 185,
            checkDocumentHeight: false,
            readMoreText: "Далее"
        });
    }


    /* old js */
    function getBrowserInfo() {
        var t = "", v = "";
        if (navigator.userAgent.indexOf('Chrome') >= 0) t = 'Chrome';
        else if (window.opera) t = 'Opera';
        else if (document.all) {
            t = 'IE';
            var nv = navigator.appVersion;
            var s = nv.indexOf('MSIE') + 5;
            v = nv.substring(s, s + 1);
        } else if (navigator.appName) t = 'Netscape';
        return { type: t, version: v };
    }

    function bookmark(a) {
        var url = window.document.location;
        var title = window.document.title;
        var b = getBrowserInfo();
        if (b.type == 'Chrome') {
            alert("К сожалению, в Google Chrome нет метода для программного добавления в Закладки... нажмите CTRL+D");
        } else if (b.type == 'IE' && b.version >= 4) {
            window.external.AddFavorite(url, title);
        } else if (b.type == 'Opera') {
            a.href = url;
            a.rel = "sidebar";
            a.title = url + ',' + title;
            return true;
        } else if (b.type == 'Netscape') {
            window.sidebar.addPanel(title, url, "");
        } else alert("Не могу определить браузер... нажмите CTRL+D для добавления страницы в Избранное");
        return false;
    }

    function check() {
        var error = 0;
        var msg = "Ошибка!\n\n";
        FN = document.find_form;
        if (FN.find_title.value == "") {
            msg = msg + "необходимо ввести слово для поиска\n";
            error = 1;
        }
        if (error != 0) {
            alert(msg);
            return false;
        } else {
            return true;
        }
    }

    var bio_block = document.getElementById("author_bio");

    if (bio_block) {
        if (bio_block.offsetHeight > 200) {
            var readMore = bio_block.querySelector('.bio_readmore');
            bio_block.classList.add('author_bio_hidden');
            readMore.innerText = 'Читать далее';

            readMore.addEventListener("click", function () {

                if (bio_block.classList.contains('author_bio_hidden')) {
                    bio_block.classList.remove('author_bio_hidden');
                    readMore.innerText = 'Свернуть описание';
                } else {
                    bio_block.classList.add('author_bio_hidden');
                    readMore.innerText = 'Читать далее';
                }

            });
        }
    }

    $('.logout_global').click(function (e) {
        $.post('/logout/', { '_csrf': getCsrfValue() }, function (data) {
            if (!data.error) {
                location.reload();
            }
        }, 'json');
        e.preventDefault();
    });

    $('#review_form').submit(function (e) {
        var form = $(this);
        form.find('.error').removeClass('error');
        form.find('.error_message').remove();
        var post = addCsrfToForm(form);
        disableInputs(form);
        $.post('', post, function (data) {
            if (!data.error) {
                form.hide();
                $("#review_send").show();
            } else {
                enableInputs(form);
                captchaRefresh(form.find('.captcha_img'));
                $.each(data.result, function (k, v) {
                    var formItem = $('[name="' + k + '"]', form);
                    formItem.addClass('error');
                    formItem.parent().prepend('<div class="error_message">' + v + '</div>');
                });

            }
        }, 'json');
        e.preventDefault();
    });

    $('.quote_message', '.review_item').click(function (e) {
        var messageBlock = $(this).parents('.message_item');
        var nickname = messageBlock.find('.nickname').html();
        var text = messageBlock.data('bbcode');

        $('#review_form').find('[name="text"]').val('[q][b]' + nickname + '[/b]' + "\n" + text + '[/q]').focus();
        e.preventDefault();
    });

    // ======== = = == = = = == = = ПОИСК
    $('#search_form').submit(function (e) {
        var form = $(this);
        var querySelector = form.find('[name="query"]');
        querySelector.val(querySelector.val().trim());
        if (querySelector.val().length < 3) {
            querySelector.focus();
            return false;
        }
        var post = addCsrfToForm(form);
        form.find('.error').removeClass('error');
        form.find('.error_message').remove();
        $('#close_global_search').removeClass('hidden');
        $('#global_search_loader').removeClass('hidden');
        form.find('[type="submit"]').addClass('hidden');

        $.post('/search', post, function (data) {
            if (!data.error) {
                $('#center_block').addClass('hidden');
                $('#center_block_hidden').html(data.result).removeClass('hidden');
            } else {
                $.each(data.result, function (k, v) {
                    $('[name="' + k + '"]', form).addClass('error');
                    $('[name="' + k + '"]').parent().prepend('<div class="error_message">' + v + '</div>');
                });
            }

            $('#global_search_loader').addClass('hidden');
            form.find('[type="submit"]').removeClass('hidden');
        }, 'json');
        e.preventDefault();
    });
    // = == = = = = == = = = == = = = Конец ПОИСКА

    $('#feedback_send_message').submit(function (e) {

        var form = $(this);

        var nameSelector = form.find('[name="name"]');
        nameSelector.val(nameSelector.val().trim());
        if (nameSelector.val().length < 3) {
            nameSelector.addClass('error');
            nameSelector.next().html('Введите Ваше Имя');
        } else {
            nameSelector.removeClass('error');
        }

        var emailSelector = form.find('[name="email"]');
        emailSelector.val(emailSelector.val().trim());
        if (emailSelector.val().length < 3) {
            emailSelector.addClass('error');
            emailSelector.next().html('Введите email в формате example@mail.com');
        } else {
            emailSelector.removeClass('error');
        }

        var titleSelector = form.find('[name="title"]');
        titleSelector.val(titleSelector.val().trim());
        if (titleSelector.val().length < 3) {
            titleSelector.addClass('error');

        } else {
            titleSelector.removeClass('error');
        }

        var textSelector = form.find('[name="text"]');
        textSelector.val(textSelector.val().trim());
        if (textSelector.val().length < 3) {
            textSelector.focus();
            textSelector.addClass('error');
            return false;
        } else {
            textSelector.removeClass('error');
        }

        var files = $('[name="imageFile"]')[0].files;
        if (files.length > 0) {
            form.append('file', files[0]);
        }

        var formData = new FormData(form[0]);


        $.ajax({
            url: '',
            type: "POST",
            dataType: "JSON",
            data: formData,
            processData: false,
            contentType: false,
            success: function (data, status) {
                if (!data.error) {
                    $('.feedback_add_form').html('Спасибо за обращение! Наша служба поддержки рассмотрит его в ближайшее время.');
                } else {
                    $.each(data.result, function (k, v) {
                        $('[name="' + k + '"]', form).addClass('error');
                        $('[name="' + k + '"]').parent().prepend('<div class="error_message">' + v + '</div>');
                    });
                }
            },
            error: function (xhr, desc, err) {

            }
        });

        e.preventDefault();
    });


    $('#register_form').submit(function (e) {
        var form = $(this);

        var post = addCsrfToForm(form);
        form.find('.error').removeClass('error');
        form.find('.error_message').remove();
        form.find('[type="submit"]').addClass('hidden');
        $.post('', post, function (data) {
            if (!data.error) {
                $('.registration_page').html('<h1>Вы успешно зарегистрированы. На вашу почту было отправлено письмо со ссылкой для активации</h1>')
            } else {
                $.each(data.result, function (k, v) {
                    $('[name="' + k + '"]', form).addClass('error');
                    $('[name="' + k + '"]').parent().prepend('<div class="error_message">' + v + '</div>');
                });
                form.find('[type="submit"]').removeClass('hidden');
            }
        }, 'json');
        e.preventDefault();
    });

    // ==============================
    $('#topic_send_message').submit(function (e) {
        var form = $(this);
        form.find('[name="act"]').val('send');
        var querySelector = form.find('[name="text"]');
        querySelector.val(querySelector.val().trim());
        if (querySelector.val().length < 3) {
            querySelector.focus();
            return false;
        }
        var post = addCsrfToForm(form);
        form.find('.error').removeClass('error');
        form.find('.error_message').remove();

        $.post('', post, function (data) {
            if (!data.error) {
                $('.forum_topic_add_form').html('Сообщение успешно отправлено.');
                location.href = data.result;
            } else {
                $.each(data.result, function (k, v) {
                    $('[name="' + k + '"]', form).addClass('error');
                    $('[name="' + k + '"]').parent().prepend('<div class="error_message">' + v + '</div>');
                });
            }
        }, 'json');
        e.preventDefault();
    });


    $('.go_preview_message', '#topic_send_message').click(function (e) {
        var form = $('#topic_send_message');
        form.find('[name="act"]').val('preview');
        var querySelector = form.find('[name="text"]');
        querySelector.val(querySelector.val().trim());
        if (querySelector.val().length < 3) {
            querySelector.focus();
            return false;
        }
        var post = addCsrfToForm(form);
        form.find('.error').removeClass('error');
        form.find('.error_message').remove();

        $('#forum_preview').html('Подождите...');

        $.post('', post, function (data) {
            if (!data.error) {
                $('#forum_preview').html(data.result);
            } else {
                $('#forum_preview').html('');
                $.each(data.result, function (k, v) {
                    $('[name="' + k + '"]', form).addClass('error');
                    $('[name="' + k + '"]').parent().prepend('<div class="error_message">' + v + '</div>');
                });
            }
        }, 'json');
        e.preventDefault();
    });


    // ==============================
    $('#thread_new_form').submit(function (e) {
        var form = $(this);
        form.find('[name="act"]').val('send');

        var titleSelector = form.find('[name="subj"]');
        titleSelector.val(titleSelector.val().trim());
        if (titleSelector.val().length < 3) {
            titleSelector.focus();
            return false;
        }

        var textSelector = form.find('[name="text"]');
        textSelector.val(textSelector.val().trim());
        if (textSelector.val().length < 3) {
            textSelector.focus();
            return false;
        }


        var post = addCsrfToForm(form);
        form.find('.error').removeClass('error');
        form.find('.error_message').remove();

        $.post(form.attr('action'), post, function (data) {
            if (!data.error) {
                $('.forum_topic_add_form').html('Тема успешно создана. Сейчас вы бедете переадресованы.');
                location.href = data.result;
            } else {
                $.each(data.result, function (k, v) {
                    $('[name="' + k + '"]', form).addClass('error');
                    $('[name="' + k + '"]').parent().prepend('<div class="error_message">' + v + '</div>');
                });
            }
        }, 'json');
        e.preventDefault();
    });

    $('#msg_edit_form').submit(function (e) {
        var form = $(this);
        form.find('[name="act"]').val('send');


        var textSelector = form.find('[name="text"]');
        textSelector.val(textSelector.val().trim());
        if (textSelector.val().length < 3) {
            textSelector.focus();
            return false;
        }


        var post = addCsrfToForm(form);
        form.find('.error').removeClass('error');
        form.find('.error_message').remove();

        $.post(form.attr('action'), post, function (data) {
            if (!data.error) {
                $('.forum_topic_add_form').html('Сообщение успешно измененно. Сейчас вы бедете переадресованы.');
                location.href = data.result;
            } else {
                $.each(data.result, function (k, v) {
                    $('[name="' + k + '"]', form).addClass('error');
                    $('[name="' + k + '"]').parent().prepend('<div class="error_message">' + v + '</div>');
                });
            }
        }, 'json');
        e.preventDefault();
    });


    $('.go_preview_message', '#thread_new_form').click(function (e) {
        var form = $('#thread_new_form');
        form.find('[name="act"]').val('preview');
        var titleSelector = form.find('[name="subj"]');
        titleSelector.val(titleSelector.val().trim());
        if (titleSelector.val().length < 3) {
            titleSelector.focus();
            return false;
        }

        var textSelector = form.find('[name="text"]');
        textSelector.val(textSelector.val().trim());
        if (textSelector.val().length < 3) {
            textSelector.focus();
            return false;
        }


        var post = addCsrfToForm(form);
        form.find('.error').removeClass('error');
        form.find('.error_message').remove();

        $('#forum_preview').html('Подождите...');

        $.post(form.attr('action'), post, function (data) {
            if (!data.error) {
                $('#forum_preview').html(data.result);
            } else {
                $('#forum_preview').html('');
                $.each(data.result, function (k, v) {
                    $('[name="' + k + '"]', form).addClass('error');
                    $('[name="' + k + '"]').parent().prepend('<div class="error_message">' + v + '</div>');
                });
            }
        }, 'json');
        e.preventDefault();
    });

    $('.go_preview_message', '#msg_edit_form').click(function (e) {
        var form = $('#msg_edit_form');
        form.find('[name="act"]').val('preview');


        var textSelector = form.find('[name="text"]');
        textSelector.val(textSelector.val().trim());
        if (textSelector.val().length < 3) {
            textSelector.focus();
            return false;
        }


        var post = addCsrfToForm(form);
        form.find('.error').removeClass('error');
        form.find('.error_message').remove();

        $('#forum_preview').html('Подождите...');

        $.post(form.attr('action'), post, function (data) {
            if (!data.error) {
                $('#forum_preview').html(data.result);
            } else {
                $('#forum_preview').html('');
                $.each(data.result, function (k, v) {
                    $('[name="' + k + '"]', form).addClass('error');
                    $('[name="' + k + '"]').parent().prepend('<div class="error_message">' + v + '</div>');
                });
            }
        }, 'json');
        e.preventDefault();
    });

    // = ===========   сонник

    $('#sonnik_send_message').submit(function (e) {
        var form = $(this);
        form.find('[name="act"]').val('send');
        var querySelector = form.find('[name="text"]');
        querySelector.val(querySelector.val().trim());
        if (querySelector.val().length < 3) {
            querySelector.focus();
            return false;
        }
        var post = addCsrfToForm(form);
        form.find('.error').removeClass('error');
        form.find('.error_message').remove();

        $.post('', post, function (data) {
            if (!data.error) {
                $('.forum_topic_add_form').html('Сообщение успешно отправлено.');
                location.href = data.result;
            } else {
                $.each(data.result, function (k, v) {
                    $('[name="' + k + '"]', form).addClass('error');
                    $('[name="' + k + '"]').parent().prepend('<div class="error_message">' + v + '</div>');
                });
            }
        }, 'json');
        e.preventDefault();
    });


    $('.go_preview_message', '#sonnik_send_message').click(function (e) {
        var form = $('#sonnik_send_message');
        form.find('[name="act"]').val('preview');
        var querySelector = form.find('[name="text"]');
        querySelector.val(querySelector.val().trim());
        if (querySelector.val().length < 3) {
            querySelector.focus();
            return false;
        }
        var post = addCsrfToForm(form);
        form.find('.error').removeClass('error');
        form.find('.error_message').remove();

        $('#sonnik_preview').html('Подождите...');

        $.post('', post, function (data) {
            if (!data.error) {
                $('#sonnik_preview').html(data.result);
            } else {
                $('#sonnik_preview').html('');
                $.each(data.result, function (k, v) {
                    $('[name="' + k + '"]', form).addClass('error');
                    $('[name="' + k + '"]').parent().prepend('<div class="error_message">' + v + '</div>');
                });
            }
        }, 'json');
        e.preventDefault();
    });


    $('.quote_message', '.sonnik_comments_block').click(function (e) {
        var messageBlock = $(this).parents('.message_item');
        var nickname = messageBlock.find('.nickname').html();
        var text = messageBlock.data('bbcode');

        $('.sonnik_comments_block').find('[name="text"]').val('[q][b]' + nickname + '[/b]' + "\n" + text + '[/q]').focus();
        e.preventDefault();
    });
    //=======================  end Сонник


    $('.quote_message', '.forum_topic').click(function (e) {
        if (!auth) {
            showNeedAuthPopup();
            return false;
        }
        var messageBlock = $(this).parents('.message_item');
        var nickname = messageBlock.find('.nickname').html();
        var text = messageBlock.data('bbcode');

        $('.forum_topic').find('[name="text"]').val('[q][b]' + nickname + '[/b]' + "\n" + text + '[/q]').focus();
        e.preventDefault();
    });

    $('.add_message_to_topic').on('click', function (e) {
        if (!auth) {
            showNeedAuthPopup();
            return false;
        }

        $('[name="text"]').focus();
        e.preventDefault();
    });

    $('.new_topic_link').on('click', function (e) {
        if (!auth) {
            showNeedAuthPopup();
            e.preventDefault();
            return false;
        }
    });

    $('#close_global_search').click(function (e) {
        $('.error_message').remove();
        $('.error').removeClass('error');
        $('#center_block_hidden').addClass('hidden').html('');
        $('#center_block').removeClass('hidden');
        $(this).addClass('hidden');
        e.preventDefault();
    });

    $('#forum_thread_new').click(function (e) {
        var subjSelector = $('[name="subj"]');
        if (subjSelector.length) {
            subjSelector.focus();
        }
        e.preventDefault();
    });


    var sortJson = [];
    $('.sort__icon span').on('click', function () {
        var $this = $(this), $parent = $this.parent(), $sort = $parent.attr('data-sort'),
            $type = $this.attr('data-type'), $table = $('.author_books_table[data-table="table_' + $sort + '"]');

        $parent.find('.active').removeClass('active');
        if (!$this.hasClass('active')) {
            $this.addClass('active');
        }

        if ($type == 'row') {
            $table.addClass('author_books_table_row');
            $table.find('img:not(.load)').each(function () {
                var $img = $(this);
                $img.attr("src", $img.attr('data-img'));
            });

            if (!$parent.hasClass('check')) {
                sortJson.push({ 'sort_table': $sort, 'type': 'row' });
                $parent.addClass('check');
            }
        } else {
            $table.removeClass('author_books_table_row');

            for (var key in sortJson) {
                if (sortJson[key].sort_table == $sort) {
                    sortJson[key].type = 'list';
                }
            }
        }
        localStorage.setItem('sort__icon', JSON.stringify(sortJson));
    });

    if (window.sessionStorage && window.localStorage && $('.sort__icon').eq(0).length) {
        var $sortIcon = $('.sort__icon'), localSortIcon = localStorage.getItem('sort__icon');
        var sortJson = localSortIcon ? JSON.parse(localSortIcon) : [];
        if (localSortIcon) {
            var sortStorage = JSON.parse(localSortIcon);

            for (var key in sortStorage) {
                var $sortWrap = $('[data-sort="' + sortStorage[key].sort_table + '"]'),
                    $table = $('.author_books_table[data-table="table_' + sortStorage[key].sort_table + '"]');

                if (sortStorage[key].type == 'row') {
                    $sortWrap.find('.active').removeClass('active');
                    $sortWrap.addClass('check').find('.sort__icon_row').addClass('active');
                    $table.addClass('author_books_table_row');
                    $table.find('img:not(.load)').each(function () {
                        var $img = $(this);
                        $img.attr("src", $img.attr('data-img'));
                    });
                } else {
                    $sortWrap.removeClass('check');
                }
            }
        }
    }
});
/* функция выполнения после полной загрузки страницы */
window.addEventListener("pageshow", function () {
    var litresWidget = document.querySelector('#litres_widget');

    if (litresWidget && !litresWidget.querySelector('table')) {
        litresWidget.style.display = 'none';
    }
});