// TODO: Make insert around selection not put the textAfter on the next line if the whole line is selected

if (!Array.prototype.filter) {
  Array.prototype.filter = function(fun /*, thisp*/)
  {
    var len = this.length;
    if (typeof fun != "function")
      throw new TypeError();

    var res = new Array();
    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in this)
      {
        var val = this[i]; // in case fun mutates this
        if (fun.call(thisp, val, i, this))
          res.push(val);
      }
    }

    return res;
  };
}

var TextEditor = {
    // The input element the editor is linked to, and buttons is a hash of elements/function_name pairs eg. {'bold':myButton, 'italic':myOtherButton}}
    initialize: function(input, buttons){
        // Clone the texteditor so we can have a separate instance per editor
        input.textEditor = jQuery.extend({}, this);
        input.textEditor.input = input; 
        
        buttons = buttons || {}
        
        // Assign the function of each button
        $.each(buttons, function(functionName, element){
            $(buttons[functionName]).click(function(event){
                event.preventDefault();
                input.textEditor[functionName]();
            });
        });
        return this;
    },

    // TEXTILE FORMATTING
    formatting:{
        bold: '**',
        italic: '_',
        orderedList: '1. ',
        unorderedList: '- ',
        fullOrderedList: '\n1. first item\n2. second item\n3. etc.\n',
        fullUnorderedList: '\n- an item\n- another item\n- etc.\n',
        blockquote: '> ',    
        fullBlockquote: '\n> Type your quote here.\n',
        table: '\ncolumn heading | column heading | column heading\n-------------- | -------------- | --------------\nyour text here | your text here | your text here\nyour text here | your text here | your text here\n',
        link: '[@@text](@@href)',
        heading1: '# ',
        heading2: '## ',
        heading3: '### '
    },

    // TEXT EDITING FUNCTIONS
    bold: function(){
        var selection = this.selection();

        // If we don't have any selection bold any word the cursor is in
        if (selection.start >= selection.end){
            this.selectWord();
        }

        this.insertAroundSelection(this.formatting.bold, this.formatting.bold);
        this.createSelection(selection.start+this.formatting.bold.length, selection.end + this.formatting.bold.length);
    },
    italic: function(){
        var selection = this.selection();

        // If we don't have any selection bold any word the cursor is in
        if (selection.start >= selection.end){
            this.selectWord();
        }

        this.insertAroundSelection(this.formatting.italic, this.formatting.italic);
        this.createSelection(selection.start+this.formatting.italic.length, selection.end + this.formatting.italic.length);
    },
    orderedList: function(){
        var selection = this.selection();
        // If we've selected some text
        // Else if we're on a line with text
        // Else if we're on a blank line        
        if (selection.start != selection.end){
            this.selectLine();
            selection = this.selection();
            this.replaceSelection('\n' + this.formatting.orderedList + selection.text.replace(/\n/g, '\n' + this.formatting.orderedList + ' ') + '\n');
        } else if (this.lineHasText()){
            this.selectLine();
            this.insertAroundSelection('\n' + this.formatting.orderedList, '\n');
            this.createSelection(selection.end,selection.end);
        } else {
            this.insertAtCaret(this.formatting.fullOrderedList);            
        }
    },
    unorderedList: function(){
        var selection = this.selection();
        // If we've selected some text
        // Else if we're on a line with text
        // Else if we're on a blank line
        if (selection.start != selection.end){
            this.selectLine();
            selection = this.selection();
            this.replaceSelection('\n' + this.formatting.unorderedList + selection.text.replace(/\n/g, '\n' + this.formatting.unorderedList + ' ') + '\n');
        } else if (this.lineHasText()){
            this.selectLine();
            this.insertAroundSelection('\n' + this.formatting.unorderedList, '\n');
            this.createSelection(selection.end,selection.end);
        } else {
            this.insertAtCaret(this.formatting.fullUnorderedList);            
        }
    },
    blockquote: function(){
        var selection = this.selection();
        // If we've selected some text
        // Else if we're on a line with text
        // Else if we're on a blank line        
        if (selection.start != selection.end){
            this.selectLine();
            selection = this.selection();
            this.replaceSelection('\n' + this.formatting.blockquote + selection.text.replace(/\n/g, '\n' + this.formatting.blockquote + ' ') + '\n');
        } else if (this.lineHasText()){
            this.selectLine();
            this.insertAroundSelection('\n' + this.formatting.blockquote, '\n');
            this.createSelection(selection.end,selection.end);
        } else {
            this.insertAtCaret(this.formatting.fullBlockquote);
        }
    },
    table: function(){
        this.replaceSelection(this.formatting.table);
    },    
    link: function(){
        var selection = this.selection();        
        if (selection.start != selection.end){
            var href = prompt('Type your link address', 'http://www.mylink.com')
            this.replaceSelection(this.formatting.link.replace('@@href', href).replace('@@text', selection.text));
        } else {
            var text = prompt('Text you want to link. e.g. "Click here"', '')
            if (!text){
                return;
            }
            var href = prompt('Type your link address', 'http://www.mylink.com')
            if (!href){
                return;
            }
            this.insertAtCaret(this.formatting.link.replace('@@href', href).replace('@@text', text));
        }
    },
    heading1: function(){
        var selection = this.selection();
        var selectionStart = selection.start + this.formatting.heading3.length;
        this.insertAtBeginningOfLine(this.formatting.heading1);
        this.createSelection(selectionStart, selectionStart);
    },
    heading2: function(){
        var selection = this.selection();
        var selectionStart = selection.start + this.formatting.heading3.length;
        this.insertAtBeginningOfLine(this.formatting.heading2);
        this.createSelection(selectionStart, selectionStart);
    },
    heading3: function(){
        var selection = this.selection();
        var selectionStart = selection.start + this.formatting.heading3.length;
        this.insertAtBeginningOfLine(this.formatting.heading3);
        this.createSelection(selectionStart, selectionStart);
    },
    linkItem: function(itemId){
        this.replaceSelection('{item:' + itemId+ '}');
    },
    
    // SELECTION MANIPULATION FUNCTIONS
    selection: function(){
        var selectionStart;
        var selectionEnd;
        var selectedText;

        selectionStart = this.input.selectionStart;
        selectionEnd = this.input.selectionEnd;
        selectedText = this.input.value.substring(selectionStart, selectionEnd);

        return {text: selectedText, start:selectionStart, end:selectionEnd}
    },
    // Selects the word the cursor is sorrounding
    selectWord: function(){
        this.createSelection(this.beginningOfWord(), this.endOfWord());
    },
    selectLine: function(){
        this.createSelection(this.beginningOfLine(), this.endOfLine());
    },
    insertAtBeginningOfLine: function(text) {        
        var scrollPos = this.input.scrollTop;                
        var lineStart = this.beginningOfLine();
        this.input.value = this.input.value.substring(0, lineStart) + text + this.input.value.substring(lineStart);
        this.input.scrollTop = scrollPos;
    },
    insertAtEndOfLine: function(text) {
        var scrollPos = this.input.scrollTop;                
        var lineEnd = this.endOfLine();
        this.input.value = this.input.value.substring(0, lineEnd) + text + this.input.value.substring(lineEnd);
        this.input.scrollTop = scrollPos;
    },
    beginningOfLine: function(){
        var selection = this.selection();
        var occurrences = this._getMatchIndices(this.input.value, /\n/);

        // Return the last match that came before the selection start or 0
        var occurrences = occurrences.filter(function(index){ return index < selection.start}).sort(this._sortFunction);
        var last = occurrences[occurrences.length-1];

        // Add 1 because the last occurrence of \n indicates the NEXT character is the beginning of the word
        return last ? last + 1 : 0;
    },
    beginningOfWord: function(){
        var selection = this.selection();
        var occurrences = this._getMatchIndices(this.input.value, /\s/);

        // Return the last match that came before the selection start or 0
        occurrences = occurrences.filter(function(index){ return index < selection.start}).sort(this._sortFunction);
        var last = occurrences[occurrences.length-1];
        
        // Add 1 because the last occurrence of \s indicates the NEXT character is the beginning of the word
        return last ? last + 1 : 0;
    },    
    endOfLine: function(){
        var selection = this.selection();
        var occurrences = this._getMatchIndices(this.input.value, /\n/);

        // Return the last match that came before the selection start or this.input.value.length
        occurrences = occurrences.filter(function(index){ return index >= selection.end}).sort(this._sortFunction);

        return occurrences[0] || this.input.value.length;
    },
    endOfWord: function(){
        var selection = this.selection();
        var occurrences = this._getMatchIndices(this.input.value, /\s/);

        // Return the last match that came before the selection start or this.input.value.length
         occurrences = occurrences.filter(function(index){ return index >= selection.end}).sort(this._sortFunction);
         
         return occurrences[0] || this.input.value.length;
    },
    lineHasText: function() {
        this.selectLine();
        return this.selection().text.match(/\S/) !== null;
    },
    replaceSelection: function(text) {
        var scrollPos = this.input.scrollTop;
        var selection = this.selection();
        var front = (this.input.value).substring(0, selection.start);
        var back = (this.input.value).substring(selection.end);
        this.input.value = front + text + back;
        this.createSelection(selection.start, selection.start);
        this.input.scrollTop = scrollPos;                    
    },            
    insertAroundSelection: function(textBefore, textAfter) {
        var selection = this.selection();
        this.replaceSelection(textBefore + selection.text + textAfter)
    },            
    insertAtCaret: function(text) {
        this.insertAroundSelection(text, '')
    },
    createSelection: function(start, end){
        this.input.focus();
        this.input.selectionStart = start;
        this.input.selectionEnd = end;
    },
    clearSelection: function(){
        var selection = this.selection();
        this.createSelection(selection.start, selection.start);
    },

    // Used to sort integers in an array
    _sortFunction: function(a,b){
        return b < a;
    },
    // Returns the indices in the string where the pattern is found
    _getMatchIndices: function(string, pattern){
        var indices = [];
        var exp = typeof pattern == 'string' ? new RegExp(pattern, 'g') : pattern;
        var matchIndex;
        var i = 0;
        for(i; i < string.length; i++){
            if ((matchIndex = string.substring(i).search(exp)) > -1){
                indices.push( matchIndex + i);
                i = matchIndex + i;
            }
        }

        return indices.length ? indices : [];           
    }    
};


// TEXT EDITOR

$(document).ready(function(){    
    // Add text editor controls to text areas
    // Do this before hints are initialize or they won't get initialized 
    var ta = $('<textarea style="position:absolute; z-index: -1"></textarea>')[0];
    $(window.document.body).append(ta);
    var teSupported = typeof ta.selectionStart != 'undefined' && typeof ta.selectionEnd != 'undefined'
    $(ta).remove();

    // If text editor is supported
    if (teSupported){
        // Create a function that makes a text editor with the controls we want
        var addTextEditor = function(element){
            var wrapper = $('<span class="text_editor_wrapper"></span>');
            var controls = $('<span class="text_editor_controls"></span>');
            var h1 = $('<span class="control" title="Heading 1">H1</span>')[0];
            var h2 = $('<span class="control heading2" title="Heading 2">H2</span>')[0];
            var h3 = $('<span class="control heading3" title="Heading 3">H3</span>')[0];
            var bold = $('<span class="control" title="Bold"><b>B</b></span>')[0];
            var italic = $('<span class="control" title="Italic"><i>I</i></span>')[0];
            var blockquote = $('<span class="control" title="Quote">&rdquo;</span>')[0];
            var ordered = $('<span class="control" title="Ordered List"><img src="<%= asset_path "text_editor/ordered_list.png" %>"/></span>')[0];
            var unordered = $('<span class="control" title="Bullet Points"><img src="<%= asset_path "text_editor/unordered_list.png" %>"/></span>')[0];
            var table = $('<span class="control" title="Insert Table"><img src="<%= asset_path "text_editor/table.png" %>"/></span>')[0];
            var link = $('<span class="control" title="Insert Link"><img src="<%= asset_path "text_editor/link.png" %>" style="padding: 7px"/></span>')[0];
            var contentSearchInput = $('<input class="popup_item_search" type="search" size="30" placeholder="Find + link to item, gallery, media, wiki" />')[0];

            controls.append(h1);
            controls.append(h2);
            controls.append(h3);
            controls.append($('<span class="separator"></span>'));
            controls.append(bold);
            controls.append(italic);
            controls.append(blockquote);
            controls.append($('<span class="separator"></span>'));
            controls.append(ordered);
            controls.append(unordered);
            controls.append($('<span class="separator"></span>'));
            controls.append(table);
            controls.append($('<span class="separator"></span>'));
            controls.append(link);
            controls.append($('<span class="separator"></span>'));
//            controls.append(contentSearchInput);

            $(element).before(wrapper)
            $(element).addClass('text_editor');
            wrapper.append(controls)
            wrapper.append(element);

            TextEditor.initialize(element, {
                'heading1':h1, 'heading2':h2, 'heading3':h3,
                'bold':bold, 'italic':italic, 'blockquote':blockquote,
                'orderedList':ordered, 'unorderedList':unordered,
                'table':table,
                'link':link});

            var textArea = element;

            // Create a spotlight search
            if(false){
                contentSearchInput.searchlight('/search', {
                    minimumCharacters: 1,
                    iconHeight: '20px',
                    iconWidth: '20px',
                    searchDelay: 100,
                    width: '300px',
                    actionFunction: function(choice){
                        textArea.textEditor.replaceSelection(choice);
                    }
                });
            }
        }        
        
        // Add it to all elements where we have a textarea that needs an editor
        $('form textarea[editor=true]').each(function(index){
            addTextEditor(this);
        });    
        
        // Add a text editor anything that has been dynamically added using the addChild functionality
        $(document).bind('childAdded', function(event){
            addTextEditor($(event.target).find('textarea[editor!=false]').first());
        })
    }
});
