ejs table build for index.ejs of places:

<% places.forEach(function(place){ %>
  <tr>
   <td><strong><a class="linkTitle" href="/places/<%= place._id%>"><%= place.name %></a></strong></td>

    <% var start = place.startdate.slice(5,7) + "/" + place.startdate.slice(8,10) + "/" + place.startdate.slice(0,4);
    var end = place.enddate.slice(5,7) + "/" + place.enddate.slice(8,10) + "/" + place.enddate.slice(0,4);
    %>

    <td><strong><%= start %></strong> - to - <strong><%= end %></strong></td>

    <td><a href="/places/<%= place._id%>/entries"> <button class="ui inverted button"><%= place.entries.length%></button></a></td>

    <td><a href="/places/<%= place.id %>/edit"><button class="ui inverted button">Edit</button></a></td>

  </tr>
<% })%>

***********************************************************