var database = firebase.database();
var name_list = [];
var admin_users = [];
var user_id = domo.env.userId;
domo.onDataUpdate(function() {});
domo.get('/data/v1/admins', { format: 'array-of-objects' }).then(function(data) {
    for (i = 0; i < data.length; i++) {
        var n = data[i].Name;
        admin_users.push(n);
    }
});
domo.get('/data/v1/tech_list', { format: 'array-of-objects' }).then(function(data) {

    var name = '';
    for (i = 0; i < data.length; i++) {
        name = data[i].Name;
        if (name_list.includes(name) === false) {
            name_list.push(name);
        }

    }

});
var submitter = (domo.env.userName == undefined) ? "someone?" : domo.env.userName.replace("+", " ");
Date.prototype.toDateInputValue = (function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0, 10);
});

$(window).on('load', function() {
    pop_new()
    $("#newE").on('click', function() {
        pop_new()
    });
    // autocomplete(document.getElementById("myInput"), name_list);


});

function pop_new() {
    var count = $("#start_c div").children().length;

    var now_date = new Date().toDateInputValue();
    var new_name = `<div>
    <div class="autocomplete" >
      <input id="myInput${count}" type="text" value="${submitter}" name="myName" placeholder="Name">
    </div>
 </div>`;
    if (count > 0) { hideWar(true); } else { hideWar(false); }
    var minus = `<div id="removeE${count}" onclick="pop_remove(${count + 1})" class="cssCircle minusSign removeE">&#8211;</div>`;
    var new_start;
    var new_end;
    var drop_list;
    var comments;
    if (count === 0) {
        new_start = `<div class="calendar" ><input id="new_start${count}"  class="calendar_start" type="datetime-local" min="2018-01-01T00:00" placeholder="2018-06-12T19:30" value='${now_date}T08:00'></div>`;
        new_end = `<div class="calendar2" ><input id="new_end${count}" class="calendar_end" type="datetime-local" min="2018-01-01T00:00" placeholder="2018-06-12T19:30" value='${now_date}T16:00'></div>`;
        drop_list = get_drop_list(count);
        comments = `<div ><input id="comments${count}" class="comments" type="text-box" placeholder="comments...."></div>`;

    } else {

        new_start = `<div class="calendar" ><input id="new_start${count}" class="calendar_start" type="datetime-local" min="2018-01-01T00:00" placeholder="2018-06-12T19:30" value='${document.getElementById(`new_start${count-1}`).value}'></div>`;
         new_end = `<div class="calendar2" ><input id="new_end${count}" class="calendar_end" type="datetime-local" min="2018-01-01T00:00" placeholder="2018-06-12T19:30" value='${document.getElementById(`new_end${count-1}`).value}'></div>`;
         drop_list =  get_drop_list(count);
         comments = `<div ><input id="comments${count}" class="comments" type="text-box" placeholder="comments...." value=${document.getElementById(`comments${count-1}`).value}></div>`;
    }
    
    
    
    $(new_name).appendTo('#name_c');
    $(new_start).appendTo('#start_c');
    autocomplete(document.getElementById(`myInput${count}`), name_list);
    $(new_end).appendTo('#end_c');
    $(drop_list).appendTo('#drop_c');
    $(comments).appendTo('#comments_c');
    if (count >= 1) {
        $(minus).appendTo('#remove');
    } else {
        $(`<div><br></div>`).appendTo('#remove');
    }
}

function get_drop_list(c) {
    var html = '';
    var count = $("#start_c div").children().length;
    var d;
    if(count ===0 ){
        d = 'Other'
    }
    else { 
        d = document.getElementById(`drop_list${count-1}`).value;
    }
    html += `<div><select id="drop_list${c}" class="drop_list" ><option value="${d}">${d}</option>`;
    domo.get('/data/v1/drop_down', { format: 'array-of-objects' }).then(function(data) {
        
        for (var i = 0; i < data.length; i++) {
            html += `<option value="${data[i].item}">${data[i].item}</option>`;
            if (i + 1 == data.length) {
                html += `</select></div>`
                $(html).appendTo('#drop_c');
            }
        }
    });

};

function pop_remove(id1) {
    id1 = id1 - 1;
    var count = $("#start_c div").children().length;
    var pos = 0;
    for (i = 0; i < count;) {


        var p = document.getElementsByClassName("calendar")[i].id;

        if (id1 == p) {
            pos = i;
        }

        if (i + 1 == count) {
            if (count > 1) {

                $('#name_c').children().slice(pos, pos + 1).remove();
                $('#start_c').children().slice(pos, pos + 1).remove();
                $('#end_c').children().slice(pos, pos + 1).remove();
                $('#drop_c').children().slice(pos, pos + 1).remove();
                $('#comments_c').children().slice(pos, pos + 1).remove();
                $('#remove').children().slice(pos, pos + 1).remove();
            }
        }
        i++;
    }
    count = $("#start_c div").children().length;
    if (count > 0) { hideWar(true); } else { hideWar(false); }

}

function check_sheet() {
    var count = $("#start_c div").children().length;
    var complete = true;
    for (var i = 0; i < count; i++) {

        var n = document.getElementsByTagName("input")[i].value;
        if (n.length < 3) {
            complete = false;
        }
        if (i + 1 == count) {
            error_check();
        }

    }

    function error_check() {
        if (complete === true) {

            submit();
        } else {

            missing_info_warning();
        }
    }
}

function submit() {
    loader(true)
    if (admin_users.includes(submitter)) {
        var count = $("#start_c div").children().length;
        console.log('made it')
        for (i = 0; i < count; i++) {
            console.log('made it2')
            var obj = {
                "Name": document.getElementsByTagName("input")[i].value,
                "StartDate": document.getElementsByClassName("calendar_start")[i].value,
                "EndDate": document.getElementsByClassName("calendar_end")[i].value,
                "Submitter": submitter,
                "Reason": document.getElementsByClassName("drop_list")[i].value,
                "Comments": (document.getElementsByClassName("comments")[i].value == undefined) ? "" : document.getElementsByClassName("comments")[i].value,
                "DateSubmitted": new Date().toDateInputValue(),
                "Approval": 'Approved',
                "Approved By": submitter,
                "Review Date": new Date().toDateInputValue()
            };
            $.ajax({
                url: `https://script.google.com/macros/s/{}/exec`,
                data: obj,
                error: function(error) {
                    console.log(`error`);
                    console.log(error);
                },
                dataType: 'json',
                success: function(data) {
                    console.log('success');
                    resetTimer();
                },
                type: "post"
            });
        }
    } else {
        var count = $("#start_c div").children().length;
        for (i = 0; i < count; i++) {
            var obj = {
                "Name": document.getElementsByTagName("input")[i].value,
                "StartDate": document.getElementsByClassName("calendar_start")[i].value,
                "EndDate": document.getElementsByClassName("calendar_end")[i].value,
                "Submitter": submitter,
                "Reason": document.getElementsByClassName("drop_list")[i].value,
                "Comments": (document.getElementsByClassName("comments")[i].value == undefined) ? "" : document.getElementsByClassName("comments")[i].value,
                "DateSubmitted": new Date().toDateInputValue(),
                "UserId":user_id



            }
            firebase.database().ref().push(obj);
            buzz_user(obj);
            resetTimer();
        }
    }




}

function clear_content() {
    var count = $("#start_c div").children().length;
    var new_count;
    for (i = 0; i < count; i++) {
        $('#name_c').children().eq(i).remove();
        $('#start_c').children().eq(i).remove();
        $('#end_c').children().eq(i).remove();
        $('#drop_c').children().eq(i).remove();
        $('#comments_c').children().eq(i).remove();
        $('#remove').children().eq(i).remove();
        new_count = $("#start_c div").children().length;
        if (new_count == 0) {
            pop_new()
        }
    }
    loader(false)

    // setTimeout(pop_new(), 20000);
}

function resetTimer() {
    var t;
    clearTimeout(t);
    t = setTimeout(clear_content, 500); // time is in milliseconds
}

function missing_info_warning() {

}





function autocomplete(inp, arr) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false; }
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
            /*check if the item starts with the same letters as the text field value:*/
            if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                /*create a DIV element for each matching element:*/
                b = document.createElement("DIV");
                /*make the matching letters bold:*/
                b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
                b.innerHTML += arr[i].substr(val.length);
                /*insert a input field that will hold the current array item's value:*/
                b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function(e) {
                    /*insert the value for the autocomplete text field:*/
                    inp.value = this.getElementsByTagName("input")[0].value;
                    /*close the list of autocompleted values,
                    (or any other open lists of autocompleted values:*/
                    closeAllLists();
                });
                a.appendChild(b);
            }
        }
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
            /*If the arrow DOWN key is pressed,
            increase the currentFocus variable:*/
            currentFocus++;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 38) { //up
            /*If the arrow UP key is pressed,
            decrease the currentFocus variable:*/
            currentFocus--;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 13) {
            /*If the ENTER key is pressed, prevent the form from being submitted,*/
            e.preventDefault();
            if (currentFocus > -1) {
                /*and simulate a click on the "active" item:*/
                if (x) x[currentFocus].click();
            }
        }
    });

    function addActive(x) {
        /*a function to classify an item as "active":*/
        if (!x) return false;
        /*start by removing the "active" class on all items:*/
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        /*add class "autocomplete-active":*/
        x[currentFocus].classList.add("autocomplete-active");
    }

    function removeActive(x) {
        /*a function to remove the "active" class from all autocomplete items:*/
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }

    function closeAllLists(elmnt) {
        /*close all autocomplete lists in the document,
        except the one passed as an argument:*/
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function(e) {
        closeAllLists(e.target);
    });
}

/*An array containing all the country names in the world:*/


/*initiate the autocomplete function on the "myInput" element, and pass along the countries array as possible autocomplete values:*/
function loader(s) {
    if (s === true) {
        console.log('loader on');
        $('#loader').show();
    } else {
        console.log('loader off');
        $('#loader').hide();
    }

}

function buzz_user(obj) {
    var m = `${obj.Name} has requested Shrink for: "${obj.Reason}" \n\nFrom: "${obj.StartDate}" \nTo: "${obj.EndDate}"\n\n Comments: "${obj.Comments}" \n\n To action on this request please go to: \nhttps://domo.domo.com/kpis/details/540344354 `;
    var data = { msg: m };

    $.ajax({
        url: `https://script.google.com/macros/s/{}/exec`,
        type: "POST",
        data: data,
        success: function(data) {
            console.log(data);
        },
        error: function(e) { console.log(e) }
    });
}

function war_request (){
    var now_date = new Date().toDateInputValue();
    var html = '';
    html +=`<a class="war">Name:</a>`
    html +=`<div class="war"><input  id="warName" type="text" value="${submitter}" name="myName" placeholder="Name"></div>`;
    html +=`<a class="war">WarRoom Date:</a>`
    html += `<div class="calendar war" ><input id="war_day"  class="calendar_start" type="date" min="2018-01-01" placeholder="2018-06-12" value='${now_date}'></div>`;
    html +=`<a class="war">Phone Day:</a>`
    html += `<div class="calendar war" ><input id="war_phone"  class="calendar_start" type="date" min="2018-01-01" placeholder="2018-06-12" value='${now_date}'></div>`;
    html += `<div class="war"><input id="submitWar" onclick="submitWar()" type="button" value="Submit War"></div>`
    document.getElementById('warContainer').innerHTML = html;
    autocomplete(document.getElementById(`warName`), name_list);
}
function submitWar(){
    var now_date = new Date().toDateInputValue();
    var obj = {
        Name: document.getElementById('warName').value,
        WarDate: document.getElementById('war_day').value,
        PhoneDate: document.getElementById('war_phone').value,
        Submitter: submitter,
        DateSubmitted: now_date
    }
    
    if(obj.WarDate === obj.PhoneDate){
        
    } 
    else{$.ajax({
        url: `https://script.google.com/macros/s/{}/exec`,
        data: obj,
        error: function(error) {
            console.log(`error`);
            console.log(error);
        },
        dataType: 'json',
        success: function(data) {
            console.log('success');
            $("#warContainer").hide();
            $("#warRoom").hide();
        },
        type: "post"
    });
    }
    
}
function hideWar(e){
    if(e===true){
        $("#warRoom").hide();}
    else{
        console.log('war show')
        $("#warRoom").show();
    } }