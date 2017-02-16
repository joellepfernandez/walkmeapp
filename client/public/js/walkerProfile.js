const Dashboard = React.createClass({
  getInitialState: function() {
    return{
      user: {
        local: {
          name: ''
        }
      },
      posts: []
    }
  },

  componentWillMount: function() {

    const statusRoute = '/walker/status'
    const postRoute = '/api/posts'
    const sendSearch = fetch(postRoute, {credentials: 'same-origin'})
    const sendStatusSearch = fetch(statusRoute, {credentials: 'same-origin'})

    var self = this

    function setPosts(data) {
      data.json().then((jsonData) => {
        // console.log(jsonData.posts)
        console.log(jsonData)
        self.setState({
          posts: jsonData.posts
        })
      })
    }

    function setUser(data) {
      data.json().then((jsonData) => {
        console.log(jsonData)
        self.setState({
          user: jsonData.user
        })
      })
    }

    sendStatusSearch.then(setUser)
    sendSearch.then(setPosts)

  },

  render: function() {
    // console.log(this.state.user)
    return(
      <div>
        <Jumbotron user={this.state.user}/>
        <Notifications posts={this.state.posts} user={this.state.user}/>
        <PostList posts={this.state.posts} user={this.state.user}/>
      </div>
    )
  }
})

const Jumbotron = React.createClass({
  render: function(){
    const user = this.props.user.local
    return(
    <div className="jumbotron">
      <div className="container">
        <h1>{user.name}s Dashboard</h1><br />
      </div>
    </div>
    )
  }
})

const PostList = React.createClass({
  handleRequest: function(p) {
    const posts = this.props.posts.map((p) => {
      const user = this.props.user
      return(
        fetch('/walker/post/' + p._id, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          method:'PATCH',
          body: JSON.stringify( { user } )
        }).then((res) => res.json()
            .then((jsonData) => {
              // console.log(jsonData.requested_by)
            }))
      )
  })
},

  render: function() {
    const feed = this.props.posts
    const posts = this.props.posts.map((p) => {
      return(
        <div key={p._id}>
        {p.walker && (<div></div>) }
        {!p.walker && (
          <li>
          <a href={'/walker/post/' + p._id}>{p.dog.name} {p.date}</a><br/>
          Owner: {p.owner.local.name}<br/>
          {p.content}<br/>
          <button onClick={this.handleRequest}>Request</button>
          </li>
        )}
        </div>
      )
    })
    return(
      <div>
        <h1>Available Walks</h1>
        <ul>{posts}</ul>
      </div>
    )
  }
})

const Notifications = React.createClass({

  render: function() {
    const user = this.props.user
    const acceptedMessage = this.props.posts.map((p) => {
      return (
        <div key={p._id}>
          {p.walker === user._id && (<p>"You've been accepted for a walk!"</p>)}
        </div>
      )
    })

      return (
        <div>
          <h1>Notifications</h1>
          {acceptedMessage}
        </div>
      )
  }
})

const Info = React.createClass({
  render: function() {
    const user = this.props.user.local
    return(
      <div>
        <h1>{user.name}s Info</h1><br />
        <h3>{user.name}</h3><br />
      </div>
    )
  }
})

ReactDOM.render(
  <Dashboard />,
  document.getElementById('root')
)
