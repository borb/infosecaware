/**
 * index controller. this renders the default root homepage.
 *
 * no functional methods - this is used simply to render the issue board template.
 */

const index = (req, res) => {
  res.render('index', {refill: {}})
}

export default index
