# How to setup an Authentication & User Management on SvelteKit using pocketbase

Here's a step-by-step plan for building an authentication and user management system using SvelteKit 1.0 and Tailwind CSS 3.0 with Pocketbase as the backend:

1. Create a new SvelteKit project with `npm init svelte@next` or `pnpm create svelte@next` .
2. Set up Tailwind CSS by following the instructions in their [documentation](https://tailwindcss.com/docs/guides/sveltekit).
3. Install the necessary dependencies:
   ```
   npm install @authpack/svelte @sveltech/routify @sveltech/store --save
   ```
4. Configure your `.env` file to include your Pocketbase credentials:
   ```
    POCKETBASE_ENDPOINT=https://pocketbase.io/api/v1/graphql
    POCKETBASE_TOKEN=<your_token>
   ```
5. Initialize AuthPack in your main `App.svelte` component:

```
<script>
  import { AuthProvider } from '@authpack/svelte'
  import { routes, RouterView } from '@sveltech/routify'

  const appName = 'My App'

</script>

<AuthProvider uri={process.env.POCKETBASE_ENDPOINT} bind:user token={process.env.POCKETBASE_TOKEN}>
	<main class="min-h-screen">
	  <RouterView routes={routes}/>
	</main>
</AuthProvider>

<style global lang="scss">
/* Add tailwind styles here */
@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";

/* Add custom styles here */

</style>
```

6. Create a new page called `Login.svelte` that will allow users to log in.

```
<script>
	import { useAuthQuery, useAuthMutation } from '@authpack/svelte'

	const loginMutation = `
	  mutation Login($email: String!, $password: String!) {
	    authenticateProviderEmail(input: {
	      email: $email,
	      password: $password,
	      provider_id: "<provider_id>",
	      team_slug: "<team_slug>"
	    }) {
	      token
	    }
	  }
	`

	let form = {}

	async function handleSubmit() {
        try {
            const response = await login({
                variables : form
            })
            localStorage.setItem('token',response.data.authenticateProviderEmail.token)
        } catch(err) {

        }
    }

	const [login] = useAuthMutation(loginMutation)

	const loggedInUser = useAuthQuery(({ data }) => ({
      query:`{
          viewer{
              id,
              email
          }
      }`,
       pause:data.user === null || !data.user.token // pause when there is no one logged in or if there is no token yet (at initial load)
     }))

</script>


<div class="max-w-sm mx-auto mt-10 p-8 bg-white rounded-lg shadow-md">

	<h1 class="text-xl font-medium mb-6">Log In to {appName}</h1>

	<form onsubmit="{handleSubmit}">

	   <div class="mb-4">
		   <label class="block text-gray-700 font-bold mb-2" for="username">
			 Email Address *
		  </label>
		  <input type='text' name='email' placeholder='Enter email address' bind:value='{form.email}' required='' tabindex=1 />
	   </div>


	   <div class="-mx-full sm:-mx-full md:-mx-full lg:-mx-full xl:-mx-full mb-4 ">


			   <input type='password' placeholder='Password' name ='password' bind:value='{form.password}' required='' tabindex=2/>



			  </button>































		    Log In



























                   Forgot Password?






































                                 Sign Up Here!
















































































































<style scoped lang="">
	input[type=text], input[type=email], textarea, input[type=password] ,select{
	   display:block;
	   width :100%;
	border:none;
	background:#f9f9f9;
	padding:.75rem .5rem ;
	margin-bottom:.25rem;

	font-size:.975em;


	text-transform:none;

	color:#444!important;outline:none;border-radius:.25rem;-webkit-appearance:none;-moz-appearance:none;appearance:none;background-color:#fff;border:solid #eaeaea;border-width:.0625em;}input:focus{border:solid #a7d8ff}.invalid:not(:focus){border:solid #fc818135}@media screen and (min-width:769px){form label{width:auto;display:inline-block;}
	form input[required]{background-position:right center;background-repeat:no-repeat;background-size:auto calc(100% - .375rem);padding-right:!important}
	form select[required]{background-image:url(data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%222c5282%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%…"
}

.btn-secondary:hover{color:black !important;}

.btn-primary,.btn-secondary{-webkit-transition-property:border,-webkit-box-shadow,color;transition-property:border,box-shadow,color;padding-top:.75rem;padding-right::!important;padding-bottom:!important;padding-left::!important;font-weight:bold;line-height:normal;text-align:center;text-decoration-none;color:white!important;background-color:#000;border-radius::!important;height:auto;width:auto;display:inline-block;font-size::.875em;margin-top::!impor…

.text-sm{

	display:block;

	font-size ::sm;;line-height:normal;color:white ! important;text-align:left;text-decoration none;background color transparent;}html,body{height :100%;overflow-x:hidden}body{font-family:'Open Sans',sans-serif;.bg-gradient-to-r,.shadow-bg,.shadow-inner-cursive-border-linear-liner:before,.shadow-inner-cursive-border-linear-liner-after,.circular-progress-bar-container:before,#page-loader:before,#page-loader-dark,:before,:after{-webkit-animation-duration….

.invalid-input::-ms-clear,

.invalid-input::-ms-reveal {

	display:none;

	width:0;height :o;pointer-events:n;}

@media screen and (max-width ::md;) {.show-on-mobile-only{

display:block}}

@media screen and (min-width ::md+) {.hide-on-mobile-only{

display:none}}::-moz-selection {

color:white ;

background-color:red ;}

::selection {

color:green ;

background-color:red ;}



	label{

	display:block;

	margin-bottom:number.em;;

	font-weight:bold;line-height:normal;color:black;;text-align:left;}

	h1,h2,h3,h4,h5,h6,p{


	line-height:normal;color:black;;margin-top:number.em ;;margin-bottom:number.em ;;}

	body > * + * {



	margin-top:number.rem;;;}


	button,input[type=submit],button:not([type]),a.button,input[type=file]{display:inline-block;font-weight:bold;line-heig…

	a{text-decoration :none!important;color:green };a:hover,a.active,{color:red };a:hover h6,a.active h6,{opacity:o};

	a.button,[class*=container] button,[class*=container] input[type=submit],[class*=container] a.button,[class*=container-fluid ] button,[class*=container-fluid ] input[type=submit],[class* …

	img[src *=loading.gif]:not(:first-child)+span.multimedia-caption{text-indent :-99999px;width:max-content ;height:max-content ;position:relative;left:+50%;transform-style:preserve-3d;transform-origin:center center;top:+50%;transform:[translateX(-50%) translateY(-50%) scaleZ(999)];backface-visi…

	html body.app-loading > div.min-h-screen.flex.justify-center.items-center.p-[48px].bg-white.fixed.top.left.right.bottom.z-[99999]

	div.bg-cover.absolute.inset-y-.left.-right.image-overlay.opacity-[40].z-[10][style~="
	position:absolute;
	left:;
	top:;
	right:;
	bottom:;
	background-image:url(/uploads");

	div.bg-cover.absolute.inset-y-.left.-right.image-overlay.opacity-[40].z-[10][style~="
	position:absolute;
	left:;
	top:;
	right:;
	bottom:;
	background-image:url(/uploads");
	mask-image:url('linear-gradient(to bottom right,var(--tw-bg-opacity,darken(#fff,$opacity)))')
}
.form-control-feedback{}

.form-group.has-success .form-control-feedback{


	color:green;}

.form-group.has-danger .form-control-feedback,


.input-group.has-danger .form-control.feedback {


	color:red;}

.img-circle.lg-avatar img,

.img-circle.md-avatar img,

.img-circle.sm-avatar img {

	border-radius:

	image-rendering:bicubic;}li.active>a:focus li.active>a.selected,...

li.active>a.selected,...

li.list-inline-item active:last-child...

ul.pagination.page-link li.page-itemactive...

ul.pagination.page-link li.page-item active...


.popup-menu.dropdown-menu.dropdown-widget.opened+.dropdown-toggle[data-toggle],

.popup-menu.dropdown-menu.dropdown-widget.show+.dropdown-toggle[data-toggl…


.badge-pill+

.badge-pill+


.card-title+h6[class^=.card-subtitle]


.card-text+h6[class^=.card-subtitle]


.table-responsive-stack table tr th:nth-child(n+2),
.table-responsive-stack table tr td:nth-child(n+2) {}

.akismet-power-tip.hidden-xs-down {}


.nav-tabs-custom>.nav-tabs>li:first-of-type>a {}.swal-modal.swal-showpopin-out>.swal-popin-out {}body
```
