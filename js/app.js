(async () => {
    const tableID = '#main-table';

    $(tableID + ' tfoot th').each(function() {
        const title = $(this).text();
        $(this).html(`<input type="text" class="input" placeholder="Filter by ${title}" />`);
    });

    const options = {
        ajax: 'http://localhost:8000/search/',
        processing: true,
        serverSide: true,
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
})();
