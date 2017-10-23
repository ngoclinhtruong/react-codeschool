class CommentBox extends React.Component {

  constructor() {
    super();

    this.state = {
      showComments: false,
      comments: []
    };
  }

  componentWillMount(){
    this._fetchComments();
  }

  render() {
    const comments = this._getComments();

    let commentNodes;
    if(!this.state.showComments){
      commentNodes = <div className="comment-list">{comments}</div>;
    }

    let buttonText = "Hide Comment";
    if(this.state.showComments){
      buttonText = "Show Comment";
    }

    return (
      <div className="comment-box">
        <CommentForm addComment={this._addComment.bind(this)}/>
        <CommentAvatarList avatars={this._getAvatars()}/>
        <h3>{this._getPopularMessage(comments.length)}</h3>
        <button onClick={this._handleClick.bind(this)}>{buttonText}</button>
        <h4 className="comment-count">{this._getCommentsTitle(comments.length)}</h4>
        {commentNodes}
      </div>
    );
  }

  // componentDidMount(){
  //   setInterval(() => this._fetchComments(), 5000);
  // }

  _getAvatars(){
    return this.state.comments.map((comment) => comment.avatarUrl);
  }

  _getPopularMessage(commentCount){
    const POPULAR_COUNT = 10;
    if (commentCount > POPULAR_COUNT) {
      return(
        <span>This post is getting really popular, dont miss out!</span>
      );
    }
  }

  _getComments(){
    return this.state.comments.map((comment) => {
      return (
        <Comment
          id={comment.id}
          author={comment.author}
          body={comment.body}
          avatarUrl={comment.avatarUrl}
          key={comment.id}
          onDelete={this._deleteComment.bind(this)}/>
      );
    });
  }

  _getCommentsTitle(commentCount){
    if(commentCount === 0){
      return ('No comment yet');
    } else if (commentCount === 1) {
      return('1 comment');
    } else {
      return(`${commentCount} comments`);
    }
  }

  _addComment(author, body){
    const comment = {
      id: this.state.comments.length + 1,
      author: author,
      body: body,
      avatarUrl: 'assets/images/avatars/avatar-default.png'
    };

    this.setState({comments: this.state.comments.concat([comment])});
  }

  _deleteComment(commentID){
    if(!commentID) {
      return;
    }

    const comments = this.state.comments.filter(
      comment => comment.id !== commentID
    );

    this.setState({comments});
  }

  _fetchComments(){
    $.ajax({
      method: 'GET',
      url: '../comments.json',
      success: (comments) => {
        this.setState({comments});
      }
    });
  }

  _handleClick(){
    this.setState({
      showComments: !this.state.showComments
    });
  }
}

class Comment extends React.Component {
  constructor() {
    super();

    this.state = {
      isAbusive: false
    };
  }

  render(){
    let commentBody;
    if(!this.state.isAbusive) {
      commentBody = this.props.body;
    } else {
      commentBody = <em>Content marked as abusive</em>;
    }

    return(
      <div className="comment">
        <img src={this.props.avatarUrl} alt={`${this.props.author}'s picture`} className="avartar"/>
        <div className="comment-header">{this.props.author}</div>
        <div className="comment-body">{commentBody}</div>
        <div className="comment-actions">
          <RemoveCommentConfirmation onDelete={this._handleDelete.bind(this)}/>
          <a href="#" onClick={this._toggleAbuse.bind(this)}>Mark as abuse</a>
        </div>
      </div>
    );
  }

  _toggleAbuse(e){
    e.preventDefault();
    this.setState({
      isAbusive: !this.state.isAbusive
    });
  }

  _handleDelete(e){
    this.props.onDelete(this.props.id);
  }
}

class CommentForm extends React.Component {
  constructor() {
    super();

    this.state = {
      characters: 0
    };
  }

  render(){
    return(
      <form className="comment-form" onSubmit={this._handleSubmit.bind(this)}>
        <label>join the Discussion</label>
        <div className="comment-form-fields">
          <input type="text" name="linh" placeholder="Name:" ref={(input) => this._author = input}/>
          <textarea name="name" rows="8" cols="80" placeholder="Comment:"
            ref={(textarea) => this._body = textarea}
            onChange = {this._getCharacterCount.bind(this)}>
          </textarea>
          <p>{this.state.characters} characters</p>
        </div>
        <div className="comment-form-actions">
          <button type="submit">Post comment</button>
        </div>
      </form>
    );
  }

  _getCharacterCount(){
    this.setState({
      characters: this._body.value.length
    });

  }

  _handleSubmit(event){
    event.preventDefault();

    if(!this._author.value || !this._body.value){
      alert("Please enter your name and comment");
      return;
    }

    let author = this._author;
    let body = this._body;

    this.props.addComment(author.value, body.value);

    this._author.value='';
    this._body.value='';

    this.setState({
      characters: 0
    });
  }
}

class CommentAvatarList extends React.Component {
  render() {
    const { avatars = [] } = this.props;
    return (
      <div className="comment-avatars">
        <h4>Authors</h4>
        <ul>
          {avatars.map((avatarUrl, i) => (
            <li key={i}>
              <img src={avatarUrl} />
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

class RemoveCommentConfirmation extends React.Component {
  constructor() {
    super();

    this.state = {
      showConfirm: false
    };
  }

  render(){
    let confirmNode;
    if(this.state.showConfirm) {
      return(
        <span>
          <a href="#" onClick={this._confirmDelete.bind(this)}>Yes</a> - or <a href="#" onClick={this._toggleConfirmMessage.bind(this)}>No</a>
        </span>
      );
    } else {
      confirmNode = <a href="#" onClick={this._toggleConfirmMessage.bind(this)}>Delete Comment?</a>;
    }
    return (
      <span>{confirmNode}</span>
    );
  }

  _toggleConfirmMessage(e){
    e.preventDefault();

    this.setState({
      showConfirm: !this.state.showConfirm
    });
  }

  _confirmDelete(e){
    e.preventDefault();

    this.props.onDelete();
  }
}

$(function(){
  ReactDOM.render(
    <CommentBox />,
    document.getElementById('comment-box')
  );
});
