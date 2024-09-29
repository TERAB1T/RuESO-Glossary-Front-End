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
        saveCheckboxes();
    }

    const tableID = '#main-table';
    let isFirstSearch = true;

    $(tableID + ' tfoot th:not(:first)').each(function() {
        const title = $(this).text();
        $(this).html(`<input type="text" class="form-control form-control-sm" placeholder="Фильтр" />`);
    });

    const options = {
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
        pageLength: 100,
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
        columnDefs: [
            {
                targets: 0,
                orderable: false,
                searchable: false,
                width: '2%',
                render: function (data, type, row) {
                    return `<img src="img/icons/${data}.png" alt="${data}" width="32px">`;
                } },
            { width: '49%', targets: [1, 2] }
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
