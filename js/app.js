(async () => {
    const tableID = '#main-table';

    $(tableID + ' tfoot th').each(function() {
        const title = $(this).text();
        $(this).html(`<input type="text" class="form-control form-control-sm" placeholder="Filter by ${title}" />`);
    });

    const options = {
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
        deferRender: true,
        orderCellsTop: true,
        autoWidth: false,
        columnDefs: [
            { width: '2%', targets: 0 },
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

    table.search('').draw();

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

    let isFirstSearch = true;

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
        table
            .search(table.search())
            .draw();
    });
})();
