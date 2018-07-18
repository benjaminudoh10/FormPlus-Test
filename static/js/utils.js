class Location {
    constructor() {}

    get_location() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(this.show_position, this.show_error);
        } else {
            $('#notif').text('Geolocation is not supported by this browser.');
        }
    }

    show_position(position) {
        var lat_lon = [position.coords.latitude, position.coords.longitude];
        var cur_date = new Date();
        var prev_date = new Date(Number(localStorage['dt'])*1000);
        var time_in_min = (cur_date - prev_date)/60000;
        if (localStorage['lat_lon']) {
            if (JSON.parse(localStorage['lat_lon']) == lat_lon && (time_in_min < 10)) {
                // Use the previous data to fill the table
                create_response_table(localStorage['weather_data']);
            }
        } else { // Send a new request
            $.ajax({
                url: '/api/'+lat_lon[0]+'/'+lat_lon[1]+'/'
            })
            .done(function(data) {
                var parsed_data = JSON.parse(data);
                localStorage.setItem('lat_lon', JSON.stringify(lat_lon));
                localStorage.setItem('dt', parsed_data['dt']);
                localStorage.setItem('weather_data', JSON.stringify(parsed_data));
                create_response_table(parsed_data);
            })
        }
    }

    show_error(error) {
        switch(error.code) {
            case error.PERMISSION_DENIED:
                $('#notif').text('User denied the request for geolocation.');
                break;
            case error.POSITION_UNAVAILABLE:
                $('#notif').text('Location information is unavailable.');
                break;
            case error.TIMEOUT:
                $('#notif').text('The request to get user location timed out.');
                break;
            case error.UNKNOWN_ERROR:
                $('#notif').text('An unknown error occurred.');
                break;
        }
        create_form();
    }
}


function create_form() {
    var form = "<div class='weather-main-text text-center'>" +
            "<input type='text' id='form-entry' placeholder='Enter your postal code or country'" +
            "class='form-control input-lg'>" +
            "<button type='button' id='form-submit' onclick='click_form_submit()' class='btn btn-success btn-lg'>Submit</button>" +
            "</div>";

    $('#weather-main').html(form);
}


function click_form_submit() {
    var place = $('#form-entry').val();
    var data_place = 'data_' + place.replace(/ /g, '');
    var dt_place = 'dt_' + place.replace(/ /g, '');
    //$('#form-entry').value = ''
    var cur_date = new Date();
    var prev_date = new Date(Number(localStorage['dt'])*1000);
    var time_in_min = (cur_date - prev_date)/60000;
    if (localStorage[data_place] && (time_in_min < 10)) {
        // Use the previous data to fill the table
        var data_of_place = JSON.parse(localStorage[data_place])
        create_response_table(data_of_place);
    } else { // Send a new request
        $.ajax({
            url: '/api/'+place+'/'
        })
        .done(function(data) {
            parsed_data = JSON.parse(data);
            $('#notif').text(data['sys']);
            localStorage.setItem(data_place, JSON.stringify(parsed_data));
            localStorage.setItem(dt_place, parsed_data['dt']);
            create_response_table(parsed_data);
        })
    }
}


function create_response_table(data) {
    var table = "<div class='weather-main-text text-center'>" +
                "<input type='text' id='form-entry' placeholder='Enter your postal code or country'" +
                "class='form-control input-lg'>" +
                "<button type='button' id='form-submit' onclick='click_form_submit()' class='btn btn-success btn-lg'>Submit</button>" +
                "</div><br>" +
                "<div>" +
                "<h1>Weather in <span id='place'></span>, <span id='country'></span></h1>" +
                "<img id='img_weather' src='' alt=''>" +
                "<table class='table table-hover'>" +
                "<tbody>" +
                "<tr>" +
                "<td>Wind</td>" +
                "<td id='wind'></td>" +
                "</tr>" +
                "<tr>" +
                "<td>Cloudiness</td>" +
                "<td id='cloudiness'></td>" +
                "</tr>" +
                "<tr>" +
                "<td>Pressure</td>" +
                "<td id='pressure'></td>" +
                "</tr>" +
                "<tr>" +
                "<td>Humidity</td>" +
                "<td id='humidity'></td>" +
                "</tr>" +
                "<tr>" +
                "<td>Temperature</td>" +
                "<td id='temp'></td>" +
                "</tr>" +
                "<tr>" +
                "<td>Geo coords</td>" +
                "<td id='coords'></td>" +
                "</tr>" +
                "</tbody>" +
                "</table>" +
                "</div>";

    $('#weather-main').html(table);

    $('#place').text(data['name']);
    $('#country').text(getCountryName(data['sys']['country']));
    $('#img-weather').src = '/static/img/' + data['weather']['icon'] + '.png';
    $('#wind').text(data['wind']['speed'] + ' m/s');
    $('#cloudiness').text(data['weather'][0]['description']);
    $('#pressure').text(data['main']['pressure'] + ' hpa');
    $('#humidity').text(data['main']['humidity']);
    $('#temp').html(data['main']['temp'] + '<sup>o</sup>C');
    $('#coords').html('<a href="https://openweathermap.org/weathermap?basemap=satellite&layer=precipitation&lat='+
                        data['coord']['lat']+
                        '&lon='+data['coord']['lon']+
                        '&zoom=15">[' + data['coord']['lat'] + ' ' + data['coord']['lon'] + ']</a>');
}


function cls_loc() {
    loc = new Location();
    loc.get_location();
}
