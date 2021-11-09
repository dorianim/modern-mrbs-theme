<h1 align="center">
    Modern MRBS Theme
</h1>

<p align="center">
    <a href="https://github.com/dorianim/modern-mrbs-theme/releases/latest">
        <img src="https://img.shields.io/github/v/release/dorianim/modern-mrbs-theme?logo=github&logoColor=white" alt="GitHub release"/>
    </a>
    <a href="https://www.gnu.org/licenses/agpl-3.0">
        <img src="https://img.shields.io/badge/License-AGPL%20v3-blue.svg" />
    </a>
</p>

A modern theme for [MRBS](https://mrbs.sourceforge.io/) based on Bootstrap 5.0.

# Features
- Modern look and feel
- More lucid layout due to collapsable field groups
- Makes MRBS installable as a PWA for easier access
- Fully responsive and easy to use

# Usage
- **Recommended:** Use my [mrbs docker container](https://github.com/dorianim/mrbs-docker). This makes sure that you always have a compatible version of mrbs and removes the need of manual installation and upgrades
- Alternative: Place the folder `modern` from this repo into the Themes folder of your mrbs. (eg. `/var/www/mrbs/Themes`) and add `$theme = "modern";` to your `config.inc.php`.

# Config
This theme adds some config options which you can use in your config.inc.php:
- `disable_menu_items_for_non_admins` (array): Array of menu items which are not visible to non-admins. Eg: 
  ```php
  $disable_menu_items_for_non_admins = ["rooms", "user_list"];
  ```
- `booking_type_colors` (map): Map of Booking type => Color to define colors of booking type without having to edit styling.inc. Eg: 
  ```php
  $booking_type_colors = array(
    'M' => "#73C78A",
    'K' => "#BEBFC2");
  ```
- `enable_pwa` (bool): Is set to True, the PWA is enabled. False by defualt. Eg:
  ```php
  $enable_pwa = True;
  ```

# PLEASE NOTE
* This theme is a quick and dirty workaround. As MRBS does not have a real theme engine, it simply injects JavaScript which then modifies the page after it is loaded.
* Some pages may not work in certain scenarios!

# Screenshots
<table align="center">
    <tr>
        <td align="center">
            <a href="https://raw.githubusercontent.com/dorianim/modern-mrbs-theme/main/.github/media/dayView.png">
                <img src="https://raw.githubusercontent.com/dorianim/modern-mrbs-theme/main/.github/media/dayView.png" alt="Days" width="500px" />
            </a>
        </td>
        <td align="center">
            <a href="https://raw.githubusercontent.com/dorianim/modern-mrbs-theme/main/.github/media/login.png">
                <img src="https://raw.githubusercontent.com/dorianim/modern-mrbs-theme/main/.github/media/login.png" alt="Login" width="500px" />
            </a>
        </td>
    </tr>
    <tr>
        <td align="center">
            <a href="https://raw.githubusercontent.com/dorianim/modern-mrbs-theme/main/.github/media/createEntry.png">
                <img src="https://raw.githubusercontent.com/dorianim/modern-mrbs-theme/main/.github/media/createEntry.png" alt="Create entry" width="500px" />
            </a>
        </td>
        <td align="center">
            <a href="https://raw.githubusercontent.com/dorianim/modern-mrbs-theme/main/.github/media/entryDetails.png">
                <img src="https://raw.githubusercontent.com/dorianim/modern-mrbs-theme/main/.github/media/entryDetails.png" alt="Entry Details" width="500px" />
            </a>
        </td>
    </tr>
</table>
