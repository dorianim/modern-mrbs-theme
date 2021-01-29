<?php
namespace MRBS;

function print_theme_footer()
{  
  global $vocab;
  $page = this_page(false, '.php');

  echo "</div>\n";  // closing the contents div, opened in print_theme_header()
  if($page !== "index")
    echo "<div class=\"footer\"><button onclick=\"window.history.back();\" class=\"btn btn-outline-secondary\"><span data-feather=\"chevron-left\"></span> " . $vocab["returnprev"] . "</button></div>"; 
  echo '<script src="Themes/modern/patch.js"></script>';  
  echo '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/js/bootstrap.bundle.min.js" integrity="sha384-ygbV9kiqUc6oa4msXn9868pTtWMgiQaeYH7/t7LECLbyPA2x65Kgf80OJFdroafW" crossorigin="anonymous"></script>';
  echo "</body>\n";
  echo "</html>\n";
}
 