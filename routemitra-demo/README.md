# RouteMitra — demo build

Ek working webapp jo bus, train aur flight ke options ek jagah, side-by-side dikhata hai —
abhi sample/dummy data ke saath (5 routes: Pune↔Bengaluru, Mumbai↔Goa, Delhi↔Jaipur,
Chennai↔Hyderabad, Mumbai↔Delhi).

## Kaise chalayein

Koi build step nahi hai. Bas `index.html` ko browser mein double-click karke khol do,
ya VS Code mein "Live Server" extension se open karo.

## Files

- `index.html` — page structure
- `style.css` — RouteMitra blueprint jaisa hi design (color tokens, fonts)
- `data.js` — sample route data + `fetchRoute(from, to)` function
- `app.js` — search, sort (cheapest/fastest), card rendering ka logic

## Real data se connect karna (agla step)

`data.js` mein `fetchRoute(from, to)` function hai jo abhi `ROUTES` object se dummy data
return karta hai. Real integration ke liye bas isi function ke andar ka code badalna hoga —
baaki poora app (UI, sorting, cards) same rahega, kyunki return shape already normalized hai:

```js
{ from, to, options: [{ mode, operator, price, duration_min, departure, arrival, link }] }
```

Kaunsi API kahan se milegi, aur kisko mail/contact form bhejna hai (RedBus, ConfirmTkt/RailYatri,
Duffel, Skyscanner) — poora detail RouteMitra Blueprint mein hai:
https://claude.ai/code/artifact/5ba4103a-e59f-4e05-b6a3-814de3be1cc8

Real API integrate hote hi:
1. Bus + train + flight API ko backend se parallel call karo (browser se seedha nahi — API
   keys client-side expose ho jaayenge).
2. Har provider ka response upar wale normalized shape mein convert karo.
3. `fetchRoute` ko is backend endpoint ko `fetch()` karne ke liye badal do.
