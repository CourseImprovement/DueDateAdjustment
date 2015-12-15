/**
 * @name $.tableFilter
 * @todo
 *  - Search through all the rows on a table and filter out the text based on input
 */
$.fn.tableFilter = function(op){
	if (!op || !op.text || !op.parent) return;
	$(this).each(function(){
		if ($(this).text().indexOf(op.text) > -1 && $(this).parents(op.parent).prop('found') == 'false'){
			$(this).parents(op.parent).prop('found', 'true');
		}
	});

	$(this).parents(op.parent).each(function(){
		if (!$(this).hasClass('picker-hidden')){
			$(this).addClass('picker-hidden');
		}
	})
}