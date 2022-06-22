# COMMIT Group Website

## Requirements

The website (for now) runs on Python 2.7. We plan to upgrade it to 3.6 soon.

## Testing

Tested on Ubuntu 20.04.

```bash
sudo apt-get -y install apache2 python python3
sudo a2enmod cgi
sudo systemctl restart apache2
```

Then to emulate the actual URL (`http://groups.csail.mit.edu/commit/`):

```bash
cd /var/www/html
sudo ln -s ~/commit-website commit
```

We need to enable CGI for the `commit` folder. Edit `/etc/apache2/sites-enabled/000-default.conf` and add the following before the `</VirtualHost>`.

```
<Directory /var/www/html/commit>
        Options +ExecCGI
        AddHandler cgi-script .py .cgi
</Directory>
```

Restart and enjoy!

```bash
sudo systemctl restart apache2
```

## Notes

people.xml
* Follow the hardcoded people

papers.bib
* Important: month has to be "June" NOT June
* The parser cannot handle nested braces properly. e.g. instead of `booktitle = {Proceedings of the 43rd {ACM} {SIGPLAN} {International} {Conference} on {Programming} {Language} {Design} and {Implementation}}` (bad), use `booktitle = "Proceedings of the 43rd ACM SIGPLAN International Conference on Programming Language Design and Implementation"` (good).
* Scripts are somewhere (paperdata.cgi?)
* Run `./add_paper.sh` to update `pp.json`

projects.xml
* featured="1" vs featured="0"

## Deployment

Location on AFS: `/afs/csail.mit.edu/group/commit/www/data`

Do not edit directly on AFS - commit/PR here, and then ask one of the website admins to pull on the server.
