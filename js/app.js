(async () => {
    const saveCheckboxes = () => {
        const checkedCheckboxes = $('.btn-check:checked').map(function () {
            return $(this).attr('name');
        }).get();

        localStorage.setItem('games', JSON.stringify(checkedCheckboxes));
    }

    const localCheckboxes = localStorage.getItem('games');

    if (localCheckboxes) {
        const savedCheckboxes = JSON.parse(localStorage.getItem('games'));

        $('.btn-check').each(function () {
            let checkboxName = $(this).attr('name');
    
            if (savedCheckboxes.includes(checkboxName)) {
                $(this).prop('checked', true);
            } else {
                $(this).prop('checked', false);
            }
        });
    } else {
        $('#btn-check-eso').prop('checked', true);
        saveCheckboxes();
    }

    const tableID = '#main-table';
    let isFirstSearch = true;

    $(tableID + ' tfoot th:not(:first)').each(function() {
        const title = $(this).text();
        $(this).html(`<input type="search" class="form-control form-control-sm" placeholder="Фильтр" />`);
    });

    const getTagName = (tag) => {
        const tags = {
            'Tribunal': 'Tribunal',
            'Bloodmoon': 'Bloodmoon',
            'Plugin': 'Официальный плагин',
            'KotN': 'Knights of the Nine',
            'SI': 'Shivering Isles',
            'Dawnguard': 'Dawnguard',
            'Hearthfire': 'Hearthfire',
            'Dragonborn': 'Dragonborn',
            'cc': 'Creation Club',
        };

        return tags[tag];
    }

    const replaceImg = (src, game, lang) => {
        src = src.replace(/\[IMG=&quot;(.*?)&quot;\]/g, (match, p1) => {
            if (game == 'eso') {
                const [src, width, height] = p1.split(':');
                return `<img src="img/${game}/${src}" width="${width}" height="${height}" class="book-image-no-bg">`;
            } else {
                return `<img src="img/${game}/${lang}/${p1}" class="book-image">`;
            }
        });
        return src;
    }

    const replaceColor = (src) => {
        return src.replace(/\[C=([0-9a-f]{6})\](.*?)\[\/C\]/gis, "<span style=\"color: #$1\">$2</span>");
    }

    const options = {
        language: {
            info: "Результаты с _START_ по _END_ (всего: _TOTAL_)",
            infoEmpty: '',
            zeroRecords: 'Ничего не найдено',
            emptyTable: ''
        },
        order: [],
        ajax: {
            url: 'http://localhost:8000/search/', 
            data: function (d) {
                const checkedGames = [];

                $(".game-checks input[type=checkbox]:checked").each(function() { 
                    checkedGames.push($(this).attr("name")); 
                });

                if (checkedGames.length)
                    d.games = checkedGames.join(',');
            }
        },
        processing: true, 
        serverSide: true,
        pageLength: 50,
        searchHighlight: true,
        pagingType: 'simple_numbers',
        deferLoading: true,
        orderCellsTop: true,
        autoWidth: false,
        layout: {
            topStart: null,
            topEnd: null,
            bottomStart: 'info',
            bottomEnd: 'paging'
        },
        columns: [
            {
                data: 'game',
                orderable: false,
                searchable: false,
                width: '2%',
                className: 'dt-center',
                render: function (data, type, row) {
                    let tag = "";

                    if (row.tag && getTagName(row.tag)) {
                        tag = `<div class="badge-tag">${getTagName(row.tag)}</div>`;
                    }

                    return `<div class="game-icon"><img src="img/icons/${data}.png" alt="${data}" width="32px">${tag}</div>`;
                }
            },
            { 
                data: 'type',
                width: '8%',
                render: function (data, type, row) {
                    if (!data || data === "null") {
                        data = "Н/Д";
                    }

                    return `<div class="type-tag">${data}</div>`;
                }
            },
            { 
                data: 'en',
                width: '45%',
                render: function (data, type, row) {
                    if (!data || data === "null") {
                        data = "";
                    }

                    if (data.includes('[IMG=')) {
                        data = replaceImg(data, row.game, 'en');
                    }

                    if (data.includes('[C=')) {
                        data = replaceColor(data);
                    }

                    return data;
                }
            },
            { 
                data: 'ru',
                width: '45%',
                render: function (data, type, row) {
                    if (!data || data === "null") {
                        data = "";
                    }

                    if (data.includes('[IMG=')) {
                        data = replaceImg(data, row.game, 'en');
                    }

                    if (data.includes('[C=')) {
                        data = replaceColor(data);
                    }

                    return data;
                }
            }
        ],
        initComplete() {
            const footerRow = $(tableID + ' tfoot tr');
            footerRow.find('th').css('padding', 8);
            $(tableID + ' thead').append(footerRow);
            $('#search_0').css('text-align', 'center');
        }
    };

    const table = $(tableID)
        .on('page.dt', () => $("html, body").animate({ scrollTop: 0 }, "fast"))
        .DataTable(options);

    table.columns().every(function() {
        const column = this;

        const columnSearch = DataTable.util.debounce(function (currentValue) {
            if (currentValue.length < 3) {
                currentValue = '';
            };

            if (column.search() !== currentValue) {
                column.search(currentValue).draw();
            }
        });

        $('input', column.footer())
            .on('keyup.DT search.DT input.DT paste.DT cut.DT', function() { columnSearch(this.value); });
    });

    const mainSearch = DataTable.util.debounce(function (currentValue) {
        if (isFirstSearch) {
            isFirstSearch = false;
            $('body').removeClass('flex-center');

            const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
            const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
        }

        if (currentValue.length < 3) {
            currentValue = '';
        };

        if (table.search() !== currentValue) {
            table
                .search(currentValue)
                .draw();
        }
    });

    $('#main-input').on( 'keyup.DT search.DT input.DT paste.DT cut.DT', function () { mainSearch(this.value); });

    $('.game-checks input[type=checkbox]').on('change', function() {
        if (!isFirstSearch) {
            table
                .search(table.search())
                .draw();
        }

        saveCheckboxes();
    });
})();
