<?php

namespace MRBS;

use MRBS\Form\Form;
use MRBS\Form\ElementInputDate;
use MRBS\Form\ElementInputSearch;
use MRBS\Form\ElementInputSubmit;
use chillerlan\QRCode\QRCode;
use chillerlan\QRCode\QROptions;

function print_head($simple)
{
  global $refresh_rate, $mrbs_company_logo, $mrbs_company, $enable_pwa, $auth;
?>

  <head>

    <meta charset="<?= get_charset() ?>">

    <!-- Improve scaling on mobile devices -->
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow, noarchive">
    <meta name="csrf_token" content="<?=htmlspecialchars(Form::getToken())?>">

    <!-- stuff for PWA -->
    <link rel="manifest" href="/mrbs-modern-pwa-manifest.webmanifest">

    <?php

    if(isset($enable_pwa) && $enable_pwa == True) {
      $pwa_source = MRBS_ROOT . "/Themes/modern/pwa";
      foreach (scandir($pwa_source) as $file) {
        $targetFile = MRBS_ROOT . "/$file";
        if ($file != "." && $file != ".." && $file != "mrbs-modern-pwa-manifest.webmanifest" && !file_exists($targetFile)) {
          copy("$pwa_source/$file", $targetFile);
        }
        else if ($file == "mrbs-modern-pwa-manifest.webmanifest" && !file_exists($targetFile)) {
          $fp = fopen("$pwa_source/$file", "r");
          $content = fread($fp, filesize("$pwa_source/$file"));
          fclose($fp);
          $content = str_replace("@@description@@", "$mrbs_company " . get_vocab("mrbs"), $content);
          $content = str_replace("@@icon.src@@", $mrbs_company_logo, $content);
          $content = str_replace("@@name@@", "$mrbs_company " . get_vocab("mrbs"), $content);
          if(get_vocab("mrbs") != "") {
            $content = str_replace("@@short_name@@", get_vocab("mrbs"), $content);
          }
          else {
            $content = str_replace("@@short_name@@", $mrbs_company, $content);
          }
          file_put_contents($targetFile, $content);
        }
      }
    }
    ?>

    <?php if (($refresh_rate != 0) && (this_page(false, '.php') == 'index')) : ?>
      <!-- If we're using JavaScript we'll do the refresh by getting a new
      -- table using Ajax requests, which means we only have to download
      -- the table not the whole page each time -->
      <noscript>
        <meta http-equiv="Refresh" content="<?= $refresh_rate ?>">
      </noscript>
    <?php endif; ?>

    <?php require_once MRBS_ROOT . "/style.inc"; ?>

    <link href="Themes/modern/static/bootstrap.min.css" rel="stylesheet">
    <link href="Themes/modern/style.css" rel="stylesheet">

    <title><?= get_vocab("mrbs") ?></title>

    <script>
      var mrbs_user = {};
      <?php if (session()->getCurrentUser() !== null) : ?>
        mrbs_user.displayName = "<?= session()->getCurrentUser()->display_name ?>";
        mrbs_user.isAdmin = <?= is_admin() ? "true" : "false" ?>;
      <?php endif; ?>
      var mrbs_company_logo = "<?= $mrbs_company_logo ?>";
      var mrbs_company = "<?= $mrbs_company ?>";
      var auth = {};
      auth["only_admins_can_book"] = <?= $auth['only_admin_can_book'] ? "true":"false" ?>;
      var vocab = {};
      vocab["mrbs"] = "<?= get_vocab("mrbs") ?>";

      
    </script>

  </head>
<?php
}

// $context is an associative array indexed by 'view', 'view_all', 'year', 'month', 'day', 'area' and 'room',
// all of which have to be set.
// When $omit_login is true the Login link is omitted.
function print_navbar($context)
{
?>
  <nav id="header_navbar" class="navbar navbar-expand-lg navbar-dark nav-pills bg-dark shadow fixed-top">
    <div class="container-fluid">
      <?= print_header_site_info() ?>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarCollapse">
        <?= print_menu_items($context); ?>
      </div>
    </div>
  </nav>
  <?php
}

function print_qr_code($context, $query) {
  global $kiosk_QR_code;
  // Add in a QR code for kiosk mode
  // (The QR code library requires PHP 7.4 or greater)
  if (isset($context['kiosk']) &&
      $kiosk_QR_code &&
      (version_compare(PHP_VERSION, 7.4) >= 0))
  {
    $url = multisite(url_base() . "/index.php?$query");
    echo '<div class="d-flex mx-lg-1 mb-2 mb-lg-0" title="' . htmlspecialchars($url) . "\">\n";
    $options = new QROptions([
      'outputType'  => QRCode::OUTPUT_MARKUP_SVG,
      'imageBase64' => false,
    ]);
    $qrcode = new QRCode($options);
    echo $qrcode->render($url);
    echo "</div>\n";
  }
}

function print_header_site_info()
{
  global $mrbs_company,
    $mrbs_company_url,
    $mrbs_company_logo;

  if (!isset($mrbs_company_url)) {
    $mrbs_company_url = multisite('index.php');
  }

  if (isset($mrbs_company_logo)) : ?>
    <a href="<?= $mrbs_company_url ?>">
      <img class="d-inline-block align-top mr-2" src="<?= $mrbs_company_logo ?>" alt="" width="40px">
    </a>
  <?php endif; ?>

  <a class="navbar-brand column" href="<?= $mrbs_company_url ?>">
    <?php if (isset($mrbs_company)) : ?>
      <?= htmlspecialchars($mrbs_company) ?><br>
    <?php endif; ?>

    <?= get_vocab('mrbs') ?>
  </a>
<?php
}

function print_menu_items($context)
{
  global $disable_menu_items_for_non_admins, 
    $mrbs_company_more_info, $kiosk_mode_enabled,
    $auth;

  $kiosk_mode_active = isset($context['kiosk']);
  $query = build_query($context);

  $menu_items = array(
    'report' => 'report.php',
    'import' => 'import.php',
    'rooms'  => 'admin.php'
  ); 
  
  if ($auth['type'] == 'db')
  {
    $menu_items['user_list'] = 'edit_users.php';
  }
  
  if ($kiosk_mode_enabled)
  {
    $menu_items['kiosk'] = 'kiosk.php';
  } 
  ?>

  <ul class="navbar-nav ml-auto" style="margin-left: auto !important;">

    <?php foreach ($menu_items as $token => $page) :
      if (!is_admin() && !empty($disable_menu_items_for_non_admins) && in_array($token, $disable_menu_items_for_non_admins))
        continue;

      if (checkAuthorised($page, true)) : ?>
        <li class="nav-item active">
          <a href="<?= htmlspecialchars(multisite("$page?$query")) ?>" class="nav-link" aria-current="page"><?= get_vocab($token) ?></a>
        </li>
    <?php endif;
    endforeach; ?>

    <?php if(isset($mrbs_company_more_info) && !$kiosk_mode_active): ?>
      <li class="nav-item active">
        <?= $mrbs_company_more_info ?>
      </li>
    <?php endif; ?>
  </ul>

  <?php 
  if(!$kiosk_mode_active) {
    print_goto_date($context);
    print_search($context);
    print_outstanding($query);
    print_edit_profile($context);
    
    if (!$context['omit_login']) {
      print_logonoff_button();
    }
  }
  else {
    print_end_kiosk_button();
    print_qr_code($context, $query);
  }
  ?>
<?php
}

function print_edit_profile($context) {
  global $user_can_edit_profile;
  $user = session()->getCurrentUser();
  if($user_can_edit_profile && isset($user)) {
    $form = new Form();

    $form_id = 'header_user_profile';

    $form->setAttributes(array(
      'id'     => $form_id,
      'method' => 'post',
      'action' => multisite('edit_users.php')
    ));

    $element = new ElementInputSubmit();
    $element->setAttribute('value', htmlspecialchars($user->display_name));
    $form->addElement($element);
    $hidden_inputs = array(
      'phase'        => '2',
      'id'          => $user->id,
      'edit_button' => $user->username
    );
    $form->addHiddenInputs($hidden_inputs);

    $form->render();
  }
}

function print_goto_date($context)
{
  global $multisite, $site;

  if (!checkAuthorised('index.php', true)) {
    // Don't show the goto box if the user isn't allowed to view the calendar
    return;
  }

  $form = new Form();

  $form_id = 'header_goto_date';

  $form->setAttributes(array(
    'id'     => $form_id,
    'method' => 'get',
    'action' => multisite('index.php')
  ))
    ->addHiddenInput('view', $context['view']);

  if (isset($context['area'])) {
    $form->addHiddenInput('area', $context['area']);
  }

  if (isset($room)) {
    $form->addHiddenInput('room', $context['room']);
  }

  if ($multisite && isset($site) && ($site !== '')) {
    $form->addHiddenInput('site', $site);
  }

  $input = new ElementInputDate();
  $input->setAttributes(array(
    'name'        => 'page_date',
    'value'       => format_iso_date($context['year'], $context['month'], $context['day']),
    'required'    => true,
    'data-submit' => $form_id,
    'onchange'    => 'this.form.submit()'
  ));

  $form->addElement($input);

  $form->render();
}

function print_search($context)
{
  if (!checkAuthorised('search.php', true)) {
    // Don't show the search box if the user isn't allowed to search
    return;
  }

  $form = new Form();

  $form->setAttributes(array(
    'id'     => 'header_search',
    'method' => 'post',
    'action' => multisite('search.php')
  ))
    ->addHiddenInputs(array(
      'view'  => $context['view'],
      'year'  => $context['year'],
      'month' => $context['month'],
      'day'   => $context['day']
    ));
    
  if (!empty($context['area'])) {
    $form->addHiddenInput('area', $context['area']);
  }
  if (!empty($context['room'])) {
    $form->addHiddenInput('room', $context['room']);
  }

  $input = new ElementInputSearch();
  $search_vocab = get_vocab('search');

  $input->setAttributes(array(
    'name'        => 'search_str',
    'placeholder' => $search_vocab,
    'aria-label'  => $search_vocab,
    'required'    => true
  ));

  $form->addElement($input);

  $form->render();
}

function print_outstanding($query)
{
  $mrbs_user = session()->getCurrentUser();

  if (!isset($mrbs_user)) {
    return;
  }

  // Provide a link to the list of bookings awaiting approval
  // (if there are any enabled areas where we require bookings to be approved)
  $approval_somewhere = some_area('approval_enabled', TRUE);
  if ($approval_somewhere && ($mrbs_user->level > 0)) {
    $n_outstanding = get_entries_n_outstanding($mrbs_user);

    $class = 'notification';

    if ($n_outstanding > 0) {
      $class .= ' attention';
    }

    echo '<a href="' . htmlspecialchars(multisite("pending.php?$query")) . '"' .
      " class=\"$class\"" .
      ' title="' . get_vocab('outstanding', $n_outstanding) .
      "\">$n_outstanding</a>\n";
  }
}

// Generate the username link, which gives a report on the user's upcoming bookings.
function print_report_link(User $user)
{
  // If possible, provide a link to the Report page, otherwise the Search page
  // and if that's not possible just print the username with no link.  (Note that
  // the Search page isn't the perfect solution because it searches for any bookings
  // containing the search string, not just those created by the user.)
  if (checkAuthorised('report.php', true)) {
    $attributes = array('action' => multisite('report.php'));
    $hidden_inputs = array(
      'phase'        => '2',
      'creatormatch' => $user->username
    );
  } elseif (checkAuthorised('search.php', true)) {
    $attributes = array('action' => multisite('search.php'));
    $hidden_inputs = array('search_str' => $user->username);
  } else {
    echo '<span>' . htmlspecialchars($user->display_name) . '</span>';
    return;
  }

  // We're authorised for either Report or Search so print the form.
  $form = new Form();

  $attributes['id'] = 'show_my_entries';
  $attributes['method'] = 'post';
  $form->setAttributes($attributes)
    ->addHiddenInputs($hidden_inputs);

  $submit = new ElementInputSubmit();
  $submit->setAttributes(array(
    'title' => get_vocab('show_my_entries'),
    'value' => $user->display_name
  ));
  $form->addElement($submit);

  $form->render();
}

function print_logonoff_button()
{
  $user_is_logged_in = session()->getCurrentUser() !== null;
  $params = array();
  $value = "";

  if (!$user_is_logged_in && method_exists(session(), 'getLogonFormParams')) {
    $params = session()->getLogonFormParams();
    $value = get_vocab('login');
  } else if ($user_is_logged_in && method_exists(session(), 'getLogoffFormParams')) {
    $params = session()->getLogoffFormParams();
    $value = get_vocab('logoff');
  } else {
    return;
  }

  if (!isset($params)) {
    return;
  }

  $form = new Form();
  $form->setAttributes(array(
    'id' => 'header_logonoff',
    'method' => $params['method'],
    'action' => $params['action']
  ));

  // A Get method will replace the query string in the action URL with a query
  // string made up of the hidden inputs.  So put any parameters in the action
  // query string into hidden inputs.
  if (utf8_strtolower($params['method']) == 'get') {
    $query_string = parse_url($params['action'], PHP_URL_QUERY);
    if (isset($query_string)) {
      parse_str($query_string, $query_parameters);
      $form->addHiddenInputs($query_parameters);
    }
  }

  // Add the hidden fields
  if (isset($params['hidden_inputs'])) {
    $form->addHiddenInputs($params['hidden_inputs']);
  }

  // The submit button
  $element = new ElementInputSubmit();
  $element->setAttribute('value', $value);
  $form->addElement($element);

  $form->render();
}

function print_end_kiosk_button()
{
  $params = array();

  $form = new Form();
  $form->setAttributes(array(
    'id' => 'header_end_kiosk',
    'method' => "post",
    'action' => "kiosk.php?kiosk=" . $_GET["kiosk"] . "&area=" . $_GET["area"] . "&room=" . $_GET["room"]
  ));

  // Add the hidden fields
  if (isset($params['hidden_inputs'])) {
    $form->addHiddenInputs($params['hidden_inputs']);
  }

  // The submit button
  $element = new ElementInputSubmit();
  $element->setAttribute('value', "End kiosk");
  $form->addElement($element);

  $form->render();
}

// Print a message which will only be displayed (thanks to CSS) if the user is
// using an unsupported browser.
function print_unsupported_message($context)
{
  echo "<div class=\"unsupported_message\">\n";
  echo "<div class=\"container\">\n";
  echo "<p>" . get_vocab('browser_not_supported', get_vocab('mrbs_abbr')) . "</p>\n";
  echo "</div>\n";
  echo "</div>\n";
}


// Print the page header
// $context is an associative array indexed by 'view', 'view_all', 'year', 'month', 'day', 'area' and 'room',
// any of which can be NULL.
// If $simple is true, then just print a simple header that doesn't require any database
// access or JavaScript (useful for fatal errors and database upgrades).
// When $omit_login is true the Login link is omitted.
function print_theme_header($context = null, $simple = false, $omit_login = false)
{
  global $multisite, $site, $default_view, $default_view_all, $style_weekends;

  // Set the context values if they haven't been given
  if (!isset($context)) {
    $context = array();
  }

  if (empty($context['area'])) {
    $context['area'] = get_default_area();
  }

  if (empty($context['room'])) {
    $context['room'] = get_default_room($context['area']);
  }

  if (!isset($context['view'])) {
    $context['view'] = (isset($default_view)) ? $default_view : 'day';
  }

  if (!isset($context['view_all'])) {
    $context['view_all'] = (isset($default_view_all)) ? $default_view_all : true;
  }

  // Need to set the timezone before we can use date()
  if ($simple) {
    // We don't really care what timezone is being used
    mrbs_default_timezone_set();
  } else {
    // This will set the correct timezone for the area
    get_area_settings($context['area']);
  }

  // If we dont know the right date then use today's
  if (!isset($context['year'])) {
    $context['year'] = date('Y');
  }
  if (!isset($context['month'])) {
    $context['month'] = date('m');
  }
  if (!isset($context['day'])) {
    $context['day'] = date('d');
  }

  $context['omit_login'] = $omit_login;

  // Get the form token now, before any headers are sent, in case we are using the 'cookie'
  // session scheme.  Otherwise we won't be able to store the Form token.
  Form::getToken();

  $headers = array("Content-Type: text/html; charset=" . get_charset());
  http_headers($headers);

  echo DOCTYPE . "\n";

  // We produce two <html> tags: one for versions of IE that we don't support and one for all
  // other browsers.  This enables us to use CSS to hide and show the appropriate text.
  echo "<!--[if lte IE 9]>\n";
  echo "<html lang=\"" . htmlspecialchars(get_mrbs_lang()) . "\" class=\"unsupported_browser\">\n";
  echo "<![endif]-->\n";
  echo "<!--[if (!IE)|(gt IE 9)]><!-->\n";
  echo "<html lang=\"" . htmlspecialchars(get_mrbs_lang()) . "\">\n";
  echo "<!--<![endif]-->\n";

  print_head($simple);

  $page = this_page(false, '.php');

  // Put some data attributes in the body element for the benefit of JavaScript.  Note that we
  // cannot use these PHP variables directly in the JavaScript files as those files are cached.
  $data = array(
    'view'          => $context['view'],
    'view_all'      => $context['view_all'],
    'area'          => $context['area'],
    'room'          => $context['room'],
    'page'          => $page,
    'page-date'     => format_iso_date($context['year'], $context['month'], $context['day']),
    'is-admin'      => (is_admin()) ? 'true' : 'false',
    'is-book-admin' => (is_book_admin()) ? 'true' : 'false',
    'lang-prefs'    => json_encode(get_lang_preferences())
  );

  if ($multisite && isset($site) && ($site !== '')) {
    $data['site'] = $site;
  }

  if (isset($context['kiosk']))
  {
    $data['kiosk'] = $context['kiosk'];
  }

  // We need $timetohighlight for the day and week views
  $timetohighlight = get_form_var('timetohighlight', 'int');
  if (isset($timetohighlight)) {
    $data['timetohighlight'] = $timetohighlight;
  }

  // Put the filename in as a class to aid styling.
  $classes = array($page);
  // And if the user is logged in, add another class to aid styling
  $mrbs_user = session()->getCurrentUser();
  if (isset($mrbs_user)) {
    $classes[] = 'logged_in';
  }

  // To help styling
  if ($view_week_number)
  {
    $classes[] = 'view_week_number';
  }
  if ($style_weekends)
  {
    $classes[] = 'style_weekends';
  }

  echo '<body class="' . htmlspecialchars(implode(' ', $classes)) . '"';
  foreach ($data as $key => $value) {
    if (isset($value)) {
      echo " data-$key=\"" . htmlspecialchars($value) . '"';
    }
  }
  echo ">\n";

  print_unsupported_message($context);

  print_navbar($context);

  // This <div> should really be moved out of here so that we can always see
  // the matching closing </div>
  echo "<div class=\"container\" id=\"container\">\n";
} // end of print_theme_header()


function build_query($context)
{
  $vars = array(
    'view'  => $context['view'],
    'page_date' => format_iso_date($context['year'], $context['month'], $context['day'])
  );

  if (!empty($context['area'])) {
    $vars['area'] = $context['area'];
  }
  if (!empty($context['room'])) {
    $vars['room'] = $context['room'];
  }
  return http_build_query($vars, '', '&');
}
