<?php
namespace MRBS;

function print_theme_footer()
{  
  global $vocab;
  $page = this_page(false, '.php');
  //closing the contents div, opened in print_theme_header()
?>
    </div>
    <div id="footer" class="footer">
      <?php if($page !== "index"): ?>
        <button onclick="window.history.back();" class="btn btn-outline-secondary"><span data-feather="chevron-left"></span> <?=$vocab["returnprev"]?> </button>
      <?php endif; ?>
    </div>

    <script src="Themes/modern/static/feather.min.js"></script>
    <script src="Themes/modern/patch.js"></script>
    <script src="Themes/modern/static/bootstrap.bundle.min.js" integrity="sha384-b5kHyXgcpbZJO/tY9Ul7kGkf1S0CWuKcCD38l8YkeH8z8QjE0GmW1gYU5S9FOnJ0"></script>
  </body>
</html>
  <?php
}
 