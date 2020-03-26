$('#contactForm').on('submit', function(e) {
    e.preventDefault();
    $.ajax({
    url: document.URL,
    type: 'PUT',
    data:{
      comment_name: $("#comment_name").val(),
      comment_email: $("#comment_email").val(),
      comment_text: $("#comment_text").val(),
      comment_date: new Date()
    },
    success: function(data){
            $("#zero_comment").hide();
            $("#temp_1").append("<div class='review_item'><div class='media'><div class='d-flex'><img src='/photos/empty_profile.png' height='40px' width='40px' alt='' /></div><div class='media-body'><h4>"+$("#comment_name").val()+"</h4><h5>"+data+"</h5></div></div><p>"+$("#comment_text").val()+"</p></div>");
            $("#comment_text").val("");
            $("#comment_email").val("");
            $("#comment_name").val("");
           },
    error: function(){
      window.location.href = document.URL;
    }
    });
});


$('#contactForm2').on('submit', function(e) {
    e.preventDefault();
    $.ajax({
    url: document.URL,
    type: 'PUT',
    data:{
      review_rating: $(".stars").attr("data-rating"),
      review_name: $("#review_name").val(),
      review_email: $("#review_email").val(),
      review_text: $("#review_text").val(),
      review_date: new Date()
    },
    success: function(data){
            update_average($(".stars").attr("data-rating"));
            $("#zero_review").hide();
            var string="<div class='review_item'><div class='media'><div class='d-flex'><img src='/photos/empty_profile.png' height='40px' width='40px' alt='' /></div><div class='media-body'><h4>"+$("#review_name").val()+"</h4><h5>"+data+"</h5>";
            for(var i=0;i<$(".stars").attr("data-rating");i++)
            {
              string+="<i class='fa fa-star'></i>";
            }
            string+="</div></div><p>"+$("#review_text").val()+"</p></div>";
            $("#temp_2").append(string);
            $("#review_text").val("");
            $("#review_email").val("");
            $("#review_name").val("");

           },
    error: function(){
      window.location.href = document.URL;
    }
    });
});

//CART
function add_to_cart(product_id){
    $.ajax({
    url: '/product/all_products',
    type: 'PUT',
    data:{
      product_id_c: product_id,
    },
    success: function(){
      alert('Product added to cart.');
    },
    error: function(res){
      console.log(res.error);
    }
    });
}

//WISHLIST ADD
function add_to_wishlist(product_id){
    $.ajax({
    url: '/product/all_products',
    type: 'PUT',
    data:{
      product_id_w: product_id,
    },
    success: function(){
      alert('Product added to wishlist.');
    },
    error: function(res){
      console.log(res.error);
    }
    });
}

//WISHLIST DELETE
function delete_from_wishlist(product_id){
    $.ajax({
    url: '/users/wishlist',
    type: 'DELETE',
    data:{
      product_id: product_id,
    },
    success: function(length){
      if(parseInt(length) > 0)
      {
        $("#"+product_id).hide();
      }
      else {
        $("#empty_wishlist").show();
        $("#w").hide();
        $("#"+product_id).hide();
      }
      alert('Product removed from wishlist.');
    },
    error: function(res){
      console.log(res.error);
    }
    });
}

function check_wishlist(length)
{
  if(length > 0)
  {
    $("#empty_wishlist").hide();
  }
}

//BILL
function update_sub_total()
{
  var s = 0;
  $(".item_total").each(function() {
    s += parseInt($(this).text());
    $(this).html($(this).html());
  });

  $(".sub_total").html(s+" ₹");
}

//BILL
function update_total(res,q,p)
{
  var quantity=document.getElementById(q).value;
  var price = parseInt(p);
  var total = price*parseInt(quantity);
  document.getElementById(res).innerHTML=total+ " ₹";
  update_sub_total();
}

function invoice(order_number)
{
  $.ajax({
  url: '/admin/invoice',
  type: 'POST',
  data:{
    order_number: order_number
  },
  success: function(){
    location.href="/admin/invoice";
  },
  error: function(res){
    console.log(res.error);
  }
  });
}

function max(x,y)
{
  if(x>y)
    return x;

  return y;
}

//MAP
function initMap() {
  var nit_trichy = {lat: 10.759265, lng: 78.813100};

  var map = new google.maps.Map(
      document.getElementById('map'), {zoom: 17, center: nit_trichy});

  var marker = new google.maps.Marker({position: nit_trichy, map: map});
}

function place_order(){
    $("#order_button").click();
}

function update_average(rating){
  var num=["one","two","three","four","five"];
  var rate = parseInt($("#"+num[parseInt(rating)-1]).text())+1;
  $("#"+num[parseInt(rating)-1]).html(" "+rate);
  var new_length =  parseInt($("#secret").text())+1;
  var new_average = (parseFloat($("#avg_review").text())*parseInt($("#secret").text())) + parseInt(rating);
  console.log(new_average);
  new_average = new_average/parseInt(new_length);
console.log(new_average);


  $("#avg_review").html(new_average.toFixed(2));
  $("#secret").html(new_length);
  var update1 = '('+new_length+' Reviews)';
  $("#update1").html(update1);
  var update2 = 'Based '+new_length+' on Reviews';
  $("#update2").html(update2);
}


document.addEventListener('DOMContentLoaded', function(){
    let stars = document.querySelectorAll('.star');
    stars.forEach(function(star){
        star.addEventListener('click', setRating);
    });

    let rating = parseInt(document.querySelector('.stars').getAttribute('data-rating'));
    let target = stars[rating - 1];
    target.dispatchEvent(new MouseEvent('click'));
});

function setRating(ev){
    let span = ev.currentTarget;
    let stars = document.querySelectorAll('.star');
    let match = false;
    let num = 0;
    stars.forEach(function(star, index){
        if(match){
            star.classList.remove('rated');
        }else{
            star.classList.add('rated');
        }

        if(star === span){
            match = true;
            num = index + 1;
        }
    });
    document.querySelector('.stars').setAttribute('data-rating', num);
}



// function update_cart(product_id){
//     $.ajax({
//     url: '/users/cart',
//     type: 'PUT',
//     data:{
//
//     },
//     success: function(){
//       console.log("Update was performed");
//     },
//     error: function(res){
//       console.log(res.error);
//     }
//     });
// }
