import Navbar from "~/components/navbar"
import { FooterPage } from "~/components/footer"
export default function About(){
    return(<>
    <Navbar></Navbar>
        <main className="md:max-w-[800px] mx-auto p-5 space-y-5 md:min-h-[70vh]" >

            <div id="aboutHeaderZone" className="space-y-1">
                <h1 className="text-5xl">Who I am</h1>
                <p className="text-2xl font-mono">Hi I'm Maile. Welcome to the Red Pallette</p>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. In qui vel voluptatum nihil eius velit quo natus dolor, eos quis sit reiciendis ex numquam dolore, eaque assumenda ipsam impedit beatae repellat ea amet consectetur non cumque. Ratione facere debitis itaque sapiente, explicabo quaerat repellendus incidunt. Voluptatem fugit omnis magnam odit nobis. Quidem, repudiandae mollitia expedita quisquam blanditiis beatae atque fuga laudantium minima iusto a optio reprehenderit corporis tenetur voluptates impedit!</p>

            </div>

            <div id="mainContentZone" className="space-y-1 grid grid-cols-2 grid-rows-1">
                <div>
                    <h2 className="text-3xl">My Heritage</h2>
                    <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Doloribus, quae recusandae. Ea, minima repellendus repellat reprehenderit fuga beatae ab repudiandae rem quasi iure quo et unde ducimus consectetur provident earum voluptatem. Ipsum voluptas doloribus error sit aperiam, ipsam, iure aliquam rem voluptatum dolores quam expedita totam illum! Dolorem placeat, optio, modi laudantium corrupti voluptates reiciendis explicabo culpa ex facere tenetur labore. Sapiente consequatur nostrum fuga error saepe nam assumenda placeat, asperiores nihil incidunt numquam possimus voluptas ab modi neque nulla.</p>
                </div>
                <img className="w-full my-auto" src="https://urbanpixxels.com/wp-content/uploads/10-15121-post/3-Days-in-Cape-Town-VA-Waterfront-Boats-Water.jpg" alt="Image of Table Mountain" />
                
            </div>

            <div id="Conclusion" className="space-y-1">
                <h2 className="text-3xl">My Business and its Ideals</h2>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Harum est reprehenderit, cumque maxime nemo quaerat tenetur nam, quasi a animi dolores, ratione voluptates nobis recusandae consectetur ea sequi rem earum cupiditate laudantium! Culpa ipsam sequi pariatur? Nobis vitae delectus at nesciunt! Maxime earum voluptatem, et beatae quam veniam molestias deserunt ad eius cupiditate eveniet veritatis. Adipisci rerum, distinctio hic numquam molestias iure incidunt commodi, quas excepturi dolore consectetur quae soluta enim maiores ea est velit deserunt, voluptates quidem animi. Maxime nihil labore reiciendis temporibus suscipit dicta, veniam inventore aspernatur sed soluta incidunt quis nemo harum eum quibusdam doloremque deleniti quam quia, aut adipisci perspiciatis sequi. Doloribus est quo, consequuntur iusto at accusantium veritatis mollitia voluptatum quia amet provident recusandae debitis ullam. Accusantium blanditiis tenetur esse?</p>
            </div>

        </main>


    <FooterPage></FooterPage>
        </>
    )
}