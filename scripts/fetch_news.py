import json
import re
import html
from pathlib import Path
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from urllib.parse import urljoin, urlparse

import requests
import feedparser
from bs4 import BeautifulSoup


ROOT = Path(__file__).resolve().parents[1]

FEEDS_FILE = ROOT / "data" / "feeds.json"
ARTICLES_FILE = ROOT / "data" / "articles.json"

MAX_ARTICLES = 50
TIMEOUT = 20

HEADERS = {
    "User-Agent": "GGNesia-NewsBot/1.0"
}


def load_json(path, default):
    if not path.exists():
        return default

    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return default


def save_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)

    with open(path, "w", encoding="utf-8") as f:
        json.dump(
            data,
            f,
            ensure_ascii=False,
            indent=2
        )


def clean_text(value):
    if not value:
        return ""

    soup = BeautifulSoup(str(value), "html.parser")

    text = soup.get_text(" ", strip=True)

    text = html.unescape(text)

    text = re.sub(r"\s+", " ", text)

    return text.strip()


def valid_url(url):
    if not url:
        return False

    try:
        parsed = urlparse(url)

        return parsed.scheme in ("http", "https")

    except Exception:
        return False


def normalize_url(url):
    if not valid_url(url):
        return ""

    parsed = urlparse(url)

    return (
        parsed.scheme.lower()
        + "://"
        + parsed.netloc.lower()
        + parsed.path
        + (("?" + parsed.query) if parsed.query else "")
    )


def get_article_link(entry):
    link = entry.get("link")

    if valid_url(link):
        return link

    links = entry.get("links", [])

    for item in links:
        href = item.get("href")

        if valid_url(href):
            return href

    return ""


def image_from_html(value, base_url):
    if not value:
        return ""

    soup = BeautifulSoup(str(value), "html.parser")

    image = soup.find("img")

    if not image:
        return ""

    src = image.get("src") or image.get("data-src")

    if not src:
        return ""

    src = urljoin(base_url, src)

    if valid_url(src):
        return src

    return ""


def get_image(entry, article_url):
    # media_content
    for media in entry.get("media_content", []) or []:
        url = media.get("url")

        if valid_url(url):
            return url

    # media_thumbnail
    for media in entry.get("media_thumbnail", []) or []:
        url = media.get("url")

        if valid_url(url):
            return url

    # enclosure
    for link in entry.get("links", []) or []:
        href = link.get("href", "")
        content_type = link.get("type", "")

        if "image" in content_type and valid_url(href):
            return href

    # gambar dari description/summary
    for field in [
        entry.get("summary"),
        entry.get("description")
    ]:
        image = image_from_html(field, article_url)

        if image:
            return image

    # gambar dari content
    for item in entry.get("content", []) or []:
        image = image_from_html(
            item.get("value", ""),
            article_url
        )

        if image:
            return image

    return ""


def get_date(entry):
    for key in [
        "published_parsed",
        "updated_parsed"
    ]:
        value = entry.get(key)

        if value:
            try:
                dt = datetime(
                    value.tm_year,
                    value.tm_mon,
                    value.tm_mday,
                    value.tm_hour,
                    value.tm_min,
                    value.tm_sec,
                    tzinfo=timezone.utc
                )

                return dt.isoformat()

            except Exception:
                pass

    for key in [
        "published",
        "updated"
    ]:
        value = entry.get(key)

        if value:
            try:
                dt = parsedate_to_datetime(value)

                if dt.tzinfo is None:
                    dt = dt.replace(
                        tzinfo=timezone.utc
                    )

                return dt.isoformat()

            except Exception:
                pass

    return datetime.now(
        timezone.utc
    ).isoformat()


def detect_game(text):
    text = text.lower()

    games = {
        "Mobile Legends": [
            "mobile legends",
            "mlbb",
            "moonton"
        ],
        "PUBG Mobile": [
            "pubg mobile",
            "pubgm"
        ],
        "Free Fire": [
            "free fire",
            "garena free fire"
        ],
        "Valorant": [
            "valorant",
            "riot games"
        ],
        "Honor of Kings": [
            "honor of kings",
            "hok"
        ],
        "Dota 2": [
            "dota 2",
            "dota2"
        ],
        "EFootball": [
            "efootball",
            "e-football"
        ],
        "Genshin Impact": [
            "genshin impact",
            "genshin"
        ],
        "Call of Duty": [
            "call of duty",
            "cod mobile"
        ]
    }

    for game, keywords in games.items():
        for keyword in keywords:
            if keyword in text:
                return game

    return "Other"


def detect_type(text):
    text = text.lower()

    esports_words = [
        "esports",
        "e-sports",
        "turnamen",
        "tournament",
        "kompetisi",
        "championship",
        "league"
    ]

    for word in esports_words:
        if word in text:
            return "esports"

    return "news"


def get_source(entry, feed):
    source = entry.get("source")

    if isinstance(source, dict):
        name = source.get("title")

        if name:
            return clean_text(name)

    return feed.get("name", "Unknown Source")


def process_feed(feed):
    feed_url = feed.get("url")

    if not feed_url:
        return []

    print(f"Mengambil: {feed.get('name', feed_url)}")

    try:
        response = requests.get(
            feed_url,
            headers=HEADERS,
            timeout=TIMEOUT
        )

        response.raise_for_status()

        parsed = feedparser.parse(
            response.content
        )

    except Exception as error:
        print(
            f"Gagal mengambil feed: {error}"
        )

        return []

    articles = []

    for entry in parsed.entries:
        title = clean_text(
            entry.get("title", "")
        )

        if not title:
            continue

        url = get_article_link(entry)

        if not url:
            continue

        description = clean_text(
            entry.get("summary")
            or entry.get("description")
            or ""
        )

        if len(description) > 240:
            description = description[:237] + "..."

        combined_text = (
            title
            + " "
            + description
        )

        article = {
            "id": normalize_url(url),
            "title": title,
            "description": description,
            "category": feed.get(
                "category",
                "Gaming News"
            ),
            "game": detect_game(
                combined_text
            ),
            "type": detect_type(
                combined_text
            ),
            "source": get_source(
                entry,
                feed
            ),
            "author": clean_text(
                entry.get(
                    "author",
                    ""
                )
            ),
            "date": get_date(entry),
            "image": get_image(
                entry,
                url
            ),
            "url": url,
            "highlight": False,
            "popular": False
        }

        articles.append(article)

    return articles


def main():
    config = load_json(
        FEEDS_FILE,
        {"feeds": []}
    )

    feeds = config.get(
        "feeds",
        []
    )

    old_articles = load_json(
        ARTICLES_FILE,
        []
    )

    if not isinstance(
        old_articles,
        list
    ):
        old_articles = []

    new_articles = []

    for feed in feeds:
        new_articles.extend(
            process_feed(feed)
        )

    print(
        f"Berita baru ditemukan: "
        f"{len(new_articles)}"
    )

    # Gabungkan berita lama + baru
    combined = (
        new_articles
        + old_articles
    )

    # Hilangkan duplikat
    unique = {}

    for article in combined:
        article_id = (
            article.get("id")
            or normalize_url(
                article.get("url", "")
            )
            or article.get("title", "").lower()
        )

        if article_id:
            unique[article_id] = article

    articles = list(
        unique.values()
    )

    # Urutkan terbaru
    articles.sort(
        key=lambda item: item.get(
            "date",
            ""
        ),
        reverse=True
    )

    # Batasi jumlah berita
    articles = articles[
        :MAX_ARTICLES
    ]

    # Highlight otomatis
    for index, article in enumerate(
        articles
    ):
        article["highlight"] = (
            index < 3
        )

        article["popular"] = (
            index < 6
        )

    save_json(
        ARTICLES_FILE,
        articles
    )

    print(
        f"Total berita tersimpan: "
        f"{len(articles)}"
    )


if __name__ == "__main__":
    main()
