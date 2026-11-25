# She is Africa Explorer

A website for exploring the 54 countries of Africa, built to go with the
**She is Africa Podcast**, whose mission is to educate people about Africa and
correct the narratives told about it. Search any African country, see its
capital, population and region, learn a "Did you know?" fact, and read the myths
the podcast wants to correct.

- **Live site:** https://www.graceidoko.tech
- **Demo video:** https://drive.google.com/file/d/1YbqbgZBukZ8lfqFCZhHqpPykUo0MGtwX/view?usp=sharing
- **Podcast:** https://www.youtube.com/@sheisafricapodcast
- **Author:** Grace Idoko ([gidoko-codes](https://github.com/gidoko-codes))

## Features

- Search by country name or capital city
- Filter by region (North, West, East, Central and Southern Africa)
- Sort by name or by population (high to low, low to high)
- Country cards showing flag, capital, population and region
- "Did you know?" fact for every country
- Myth vs. Fact boxes for selected countries
- Loading indicator while data is fetched
- Error handling: a clear message if the data cannot be loaded, and a
  "No country matches your search" message for empty results
- Responsive layout that works on phones

## APIs and credits

| Resource | Used for | Documentation |
|----------|----------|---------------|
| World Bank Open Data API | Capital city, income data and total population for each country | https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation |
| Flagcdn | Country flag images | https://flagcdn.com |

- Both services are free and need **no API key**, so there are no secrets or
  credentials in this repository.
- The World Bank is a well-known, official source. Requests go over HTTPS and
  only read public data.
- The "Did you know?" facts and myths were written for the podcast and checked
  against public sources.

## How it works

`app.js` keeps a list of the 54 African country codes grouped into five regions.
It requests the country list and population figures from the World Bank API,
keeps only the 54 African countries, merges the two results and shows each
country as a card. `facts.js` and `myths.js` hold the written content.

## Run it locally

You only need a web browser.

1. Clone the repository:
   ```
   git clone git@github.com:gidoko-codes/africa-explorer.git
   cd africa-explorer
   ```
2. Open `index.html` in your browser (double click it), or serve it with:
   ```
   python3 -m http.server 8000
   ```
   and open http://localhost:8000

## Deployment

The site is static, so each web server only needs the files in `/var/www/html`,
served by nginx.

1. Load your SSH key once: `ssh-add ~/.ssh/id_rsa_alu`
2. Run the deploy script from the project folder:
   ```
   ./deploy.sh
   ```
   It copies `index.html`, `style.css`, `app.js`, `facts.js` and `myths.js` to
   web-01 and web-02 and places them in `/var/www/html`.
3. Check each server:
   ```
   curl -s http://WEB01_IP | grep -i "Africa Explorer"
   curl -s http://WEB02_IP | grep -i "Africa Explorer"
   ```

### Load balancer

lb-01 runs HAProxy and splits incoming traffic between web-01 and web-02 using
round robin. It also handles HTTPS with a Let's Encrypt certificate and
redirects HTTP to HTTPS.

```
frontend www-http
    bind *:80
    http-request redirect scheme https code 301 unless { ssl_fc }
    default_backend web_servers

frontend www-https
    bind *:443 ssl crt /etc/haproxy/certs/www.graceidoko.tech.pem
    http-request set-header X-Forwarded-Proto https
    default_backend web_servers

backend web_servers
    balance roundrobin
    server 7284-web-01 16.60.112.164:80 check
    server 7284-web-02 18.171.55.105:80 check
```

### Testing the load balancer

Each web server adds an `X-Served-By` header with its hostname. Requests
through the load balancer should alternate between the two servers:

```
for i in 1 2 3 4; do curl -sI https://www.graceidoko.tech | grep -i x-served-by; done
```

## Challenges and how I solved them

- **The country API I first chose stopped working.** The REST Countries version
  I started with was retired and the new one needs an account and key. I switched
  to the World Bank API, which is stable and free.
- **A security filter blocked my request.** Asking for all 54 countries in one
  long URL looked like an attack and was blocked. I now request the full list
  and keep only my 54 countries in code.
- **The World Bank does not group Africa the way I wanted.** It splits North
  Africa from the rest, so I defined my own five regions in the code.
- **Bugs from missing braces and typos.** Tools like the browser console showed
  me the exact line of each error, and I fixed them one at a time.
- **Planned feature left out:** I planned to list podcast episodes with the
  YouTube Data API, but I did not have time to build it safely. It is the next
  feature I would add.

## Project files

| File | Purpose |
|------|---------|
| `index.html` | Page structure |
| `style.css` | Design and mobile layout |
| `app.js` | Fetches country data, search, filter and sort |
| `facts.js` | "Did you know?" fact for each country |
| `myths.js` | Myth vs. Fact entries |
| `deploy.sh` | Copies the site to both web servers |

## Acknowledgements

- World Bank Open Data for the country data
- Flagcdn for the flag images
- The She is Africa Podcast for the inspiration and mission
