import { canSSRAuth } from "../../utils/canSSRAuth"
import Head from 'next/head'
import {Header} from "../../components/Header";
import styles from './styles.module.scss';
import {FiRefreshCcw} from "react-icons/fi";
import {setupAPIClient} from "../../services/api";
import {useState} from "react";
import Modal from "react-modal";
import ModalOrder from "../../components/ModalOrder";

type ItemProps = {
    id: string;
    table: string | number;
    status: boolean;
    draft: boolean;
    name: string | null;
}

interface HomeProps{
    orders: ItemProps[];
}

export type OrderItemProps = {
    id: string;
    amount: number;
    order_id: string;
    product_id: string;
    product: {
        id: string;
        name: string;
        description: string;
        price: number;
        banner: string;
    }

    order: {
        id: string;
        table: string | null;
        status: boolean;
        name: string | null;
    }
}

export default function Dashboard({orders}: HomeProps) {

    const [orderList, setOrderList] = useState(orders || []);

    const [modalItem, setModalItem] = useState<OrderItemProps[]>();
    const [modalVisible, setModalVisible] = useState(false);

    function handleCloseModal() {
        setModalVisible(false);
    }

    async function handleOpenModalView(id: string) {
        const apiClient = setupAPIClient();

        const response = await apiClient.get('/order/detail', {
            params: {
                order_id: id
            }
        });

        setModalItem(response.data);

        console.log("Teste modalItem")
        console.log(response)

        setModalVisible(true);
    }

    async function handleFinishItem(id: string) {
        const apiClient = setupAPIClient();

        await apiClient.put('/order/finish', {
            order_id: id
        })
        handleUpdateListOrders();
        setModalVisible(false)

    }

    async function handleUpdateListOrders() {
        const apiClient = setupAPIClient();

        const response = await apiClient.get('/order');

        setOrderList(response.data)
    }

    //Id da 1° div dentro do <body> ao inspecionar
    Modal.setAppElement('#__next');

    return (
        <>
            <Head>
                <title>
                    Painel- Pizzaria
                </title>
            </Head>
            <div>
                <Header/>

                <main className={styles.container}>

                    <div className={styles.containerHeader}>
                        <h1>Útilmos Pedidos</h1>
                        <button onClick={handleUpdateListOrders}>
                            <FiRefreshCcw size={25} color='#3fffa3'/>
                        </button>
                    </div>

                    <article className={styles.listOrders}>

                        {orderList.length === 0 && (
                            <span className={styles.emptyList}>
                                Nenhum pedido aberto encontrado.
                            </span>
                        )}

                        {orderList.map(item => (
                            <section key={item.id} className={styles.orderItem}>
                                <button onClick={() => handleOpenModalView(item.id)}>
                                    <div className={styles.tag}></div>
                                    <span>Mesa {item.table}</span>
                                </button>
                            </section>
                        ))}


                    </article>
                </main>

                {modalVisible && (
                    <ModalOrder
                        isOpen={modalVisible}
                        onRequestClose={handleCloseModal}
                        order={modalItem}
                        handleFinishItem={handleFinishItem}
                    />
                )}
            </div>
        </>
    )
}

export const getServerSideProps = canSSRAuth(async (ctx) => {

    const apiClient = setupAPIClient(ctx);

    const response = await apiClient.get('/order');

    console.log(response.data)

    return {
        props:{
            orders: response.data
        }
    }
})
