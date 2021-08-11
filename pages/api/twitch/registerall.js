export default async function handler(req, res) {
  console.log(req.url);

  res.status(200).send();
}
